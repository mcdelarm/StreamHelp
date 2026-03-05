from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from base.models import Movies, StreamingOptionInstance, StreamingProvider, Languages, Genres, WatchedMovie, Actor, Director, MovieActor
from .serializers import MovieSerializer, StreamingOptionInstanceSerializer, StreamingProviderSerializer, LanguageSerializer, GenreSerializer, WatchedMovieSerializer, WatchedMovieCreateSerializer, WatchedMovieUpdateSerializer, DirectorSerializer, ActorSerializer, MoviesListSerializer
from .pagination import MoviePagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.utils import timezone
from base.recommendations.recommendations import recommend_movies_for_user, fetch_similar_movies


@api_view(['GET'])
def getRoutes(request):
  routes = [
    'GET /api',
    'GET /api/movies',
    'GET /api/streaming-providers',
    'GET /api/genres',
    'GET /api/languages',
    'GET /api/streaming-options/:id',
    'GET /api/movies/:filters',
  ]
  return Response(routes)

class MovieListView(ListAPIView):
  serializer_class = MoviesListSerializer
  pagination_class = MoviePagination

  def get_queryset(self):
    filters = self.request.query_params
    queryset = Movies.objects.filter(content_based_vector__isnull=False)

    if 'title' in filters:
      queryset = queryset.filter(title__icontains=filters['title'])
    if 'min_release_year' in filters:
      min_release_year = int(filters['min_release_year'])
      queryset = queryset.filter(release_date__year__gte=min_release_year)
    if 'max_release_year' in filters:
      max_release_year = int(filters['max_release_year'])
      queryset = queryset.filter(release_date__year__lte=max_release_year)
    if 'vote_count' in filters:
      vote_count = int(filters['vote_count'])
      queryset = queryset.filter(imdb_votes__gte=vote_count)
    if 'genres' in filters:
      genre_list = filters['genres'].split(',')
      queryset = queryset.filter(genres__name__in=genre_list).distinct()
    if 'actors' in filters:
      actor_ids = [int(a) for a in filters['actors'].split(',')]
      queryset = queryset.filter(cast__id__in=actor_ids).distinct()
    if 'directors' in filters:
      director_ids = [int(a) for a in filters['directors'].split(',')]
      queryset = queryset.filter(director__id__in=director_ids).distinct()
    if 'languages' in filters:
      languages = filters['languages'].split(',')
      queryset = queryset.filter(original_language__id__in=languages).distinct()
    if 'min_rating' in filters:
      min_rating = float(filters['min_rating'])
      queryset = queryset.filter(imdb_rating__gte=min_rating)
    if 'min_runtime' in filters:
      min_runtime = int(filters['min_runtime'])
      queryset = queryset.filter(runtime__gte=min_runtime)
    if 'max_runtime' in filters:
      max_runtime = int(filters['max_runtime'])
      queryset = queryset.filter(runtime__lte=max_runtime)
    if 'hide_watched' in filters and filters['hide_watched'] == 'true' and self.request.user.is_authenticated:
      watched_ids = WatchedMovie.objects.filter(user=self.request.user).values_list('movie_id', flat=True)
      queryset = queryset.exclude(id__in=watched_ids)
    #Handle both price and streaming services logic together
    if 'price' in filters:
      price_types = filters['price'].split(',')
      global_types = {'free', 'ads', 'rent', 'buy'}
      price_filter = Q()
      for type in price_types:
        if type in global_types:
          price_filter |= Q(streaming_services__type=type)
          #Display all movies that are free, ads, rent, or buy regardless of streaming service
      
      if 'subscription' in price_types:
        if 'streaming_services' in filters:
          subscription_services = filters['streaming_services'].split(',')
          price_filter |= Q(streaming_services__type='subscription', streaming_services__provider__provider_name__in=subscription_services)
          #include movies that are subscription based but only if they are on the streaming services specified in the filters
        else:
          price_filter |= Q(streaming_services__type='subscription')
          #include all subscription based movies regardless of streaming service if no streaming services are specified in the filters
    if 'streaming_services' in filters:
      streaming_services = filters['streaming_services'].split(',')
      streaming_filter = Q()
      for service in streaming_services:
        streaming_filter |= Q(streaming_services__provider__provider_name__icontains=service)
        #include all movies that are on the streaming services specified in the filters regardless of price type
    
    if 'price' in filters and 'streaming_services' in filters:
      #if price and streaming services filters are present, 
      queryset = queryset.filter(price_filter | streaming_filter).distinct()
    elif 'price' in filters:
      queryset = queryset.filter(price_filter).distinct()
    elif 'streaming_services' in filters:
      queryset = queryset.filter(streaming_filter).distinct()
    
    if 'sort' in filters:
      soft_field = filters['sort']
      sort_direction = filters['sort_direction']
      if sort_direction == 'asc':
        queryset = queryset.order_by(F(soft_field).asc(nulls_last=True))
      else:
        queryset = queryset.order_by(F(soft_field).desc(nulls_last=True))


    return queryset


@api_view(['GET'])
def getStreamingProviders(request):
  queryset = StreamingProvider.objects.all()
  serializer = StreamingProviderSerializer(queryset, many=True)
  return Response(serializer.data)

@api_view(['GET'])
def getGenres(request):
  queryset = Genres.objects.all()
  serializer = GenreSerializer(queryset, many=True)
  return Response(serializer.data)

@api_view(['GET'])
def getLanguages(request):
  queryset = Languages.objects.all()
  serializer = LanguageSerializer(queryset, many=True)
  return Response(serializer.data)

@api_view(['GET'])
def getActors(request):
  name = request.GET.get('name')
  print(name)
  if name:
    queryset = Actor.objects.filter(name__icontains=name).order_by('-popularity')[:5]
  else:
    queryset = Actor.objects.all().order_by('-popularity')[:5]
  serializer = ActorSerializer(queryset, many=True)
  return Response(serializer.data)

@api_view(['GET'])
def getDirectors(request):
  name = request.GET.get('name')
  print(name)
  if name:
    queryset = Director.objects.filter(name__icontains=name).order_by('-popularity')[:5]
  else:
    queryset = Director.objects.all().order_by('-popularity')[:5]
  serializer = DirectorSerializer(queryset, many=True)
  return Response(serializer.data)


@api_view(['GET'])
def getStreamingOptions(request, pk):
  movie = get_object_or_404(Movies, id=pk)
  streaming_options = StreamingOptionInstance.objects.filter(movie=movie)
  serializer = StreamingOptionInstanceSerializer(streaming_options, many=True)
  return Response(serializer.data)


@api_view(['GET'])
def getMovie(request, pk):
  movie = get_object_or_404(Movies, id=pk)
  serializer = MovieSerializer(movie)
  return Response(serializer.data)

class MyTokenObtainPairView(TokenObtainPairView):
  serializer_class = MyTokenObtainPairSerializer

@api_view(['POST'])
def signUpUser(request):
  data = request.data
  username = data.get('username')
  email = data.get('email')
  password = data.get('password')

  if not username or not password or not email:
    return Response({'detail': 'Username, email, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
  
  if User.objects.filter(username=username).exists():
    return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
  if User.objects.filter(email=email).exists():
    return Response({'detail': 'Email already registered to an account.'}, status=status.HTTP_400_BAD_REQUEST)
  
  #eventually work towards validating the password making it more secure

  user = User.objects.create_user(username=username, email=email, password=password)
  user.save()

  #generate jwt tokens
  serializer = MyTokenObtainPairSerializer(data={'username': username, 'password': password})
  if serializer.is_valid():
    return Response(serializer.validated_data, status=status.HTTP_201_CREATED)
  else:
    return Response({'detail': 'Failed to generate token.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getWatchedMovies(request):
  user = request.user
  watched_movies = WatchedMovie.objects.filter(user=user)
  sort_field = request.query_params.get('sort')
  if sort_field:
    watched_movies = watched_movies.order_by(sort_field)
  paginator = MoviePagination()
  paginated_qs = paginator.paginate_queryset(watched_movies, request)
  serializer = WatchedMovieSerializer(paginated_qs, many=True)
  return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def postWatchedMovie(request):
  serializer = WatchedMovieCreateSerializer(data=request.data)
  if serializer.is_valid():
    watched_movie = serializer.save(user=request.user)
    print(watched_movie.watched_date)
    return Response({
      "message": "Movie added to watched list.",
    }, status=status.HTTP_201_CREATED)
  return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMovieRating(request, pk):
  rating = None
  user = request.user
  watched_movies = WatchedMovie.objects.filter(user=user)
  queryset = watched_movies.filter(movie=pk)
  if len(queryset) > 0:
    rating = queryset[0].rating
  return Response({"rating": rating}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def updateWatchedMovie(request, pk):
  try:
    watched_movie = WatchedMovie.objects.get(movie=pk, user=request.user)
    print(watched_movie)
  except WatchedMovie.DoesNotExist:
    return Response({'error': 'Movie not fouhd.'}, status=status.HTTP_404_NOT_FOUND)
  
  serializer = WatchedMovieUpdateSerializer(watched_movie, data=request.data, partial=True)
  if serializer.is_valid():
    print("Serializer is valid.")
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)
  return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setMovieRating(request, pk):
  user = request.user
  rating = request.data.get('rating')
  
  if rating is None:
    return Response({'error': 'Rating required'}, status=400)
  
  watched_movie, created = WatchedMovie.objects.update_or_create(
    user=user,
    movie_id=pk,
    defaults={'rating': rating}
  )

  if created:
    watched_movie.watched_date = timezone.now()
    watched_movie.save(update_fields=['watched_date'])
  
  return Response({
    'created': created,
    'rating': watched_movie.rating
  }, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getRecommendedMovies(request):
  limit = 20
  movies = recommend_movies_for_user(request.user, limit)
  serializer = MoviesListSerializer(movies, many=True)
  return Response(serializer.data)

@api_view(['GET'])
def getSimilarMovies(request, pk):
  limit = 20
  movies = fetch_similar_movies(pk, limit)
  serializer = MoviesListSerializer(movies, many=True)
  return Response(serializer.data)