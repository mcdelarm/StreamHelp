from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from base.models import Movies, StreamingOptionInstance, StreamingProvider, Languages, Genres, WatchedMovie
from .serializers import MovieSerializer, StreamingOptionInstanceSerializer, StreamingProviderSerializer, LanguageSerializer, GenreSerializer, WatchedMovieSerializer, WatchedMovieCreateSerializer, WatchedMovieUpdateSerializer
from .pagination import MoviePagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

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
  serializer_class = MovieSerializer
  pagination_class = MoviePagination

  def get_queryset(self):
    filters = self.request.query_params
    queryset = Movies.objects.all()

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
      queryset = queryset.filter(vote_count__gte=vote_count)
    # if 'original_title' in filters:
    #   queryset = queryset.filter(original_title__icontains=filters['original_title'])
    if 'streaming_services' in filters:
      streaming_services = filters['streaming_services'].split(',')
      streaming_filter = Q()
      for service in streaming_services:
        streaming_filter |= Q(streaming_services__provider__provider_name__icontains=service)
      queryset = queryset.filter(streaming_filter).distinct()
    if 'genres' in filters:
      genre_list = filters['genres'].split(',')
      print(genre_list)
      queryset = queryset.filter(genres__name__in=genre_list).distinct()
    if 'languages' in filters:
      languages = filters['languages'].split(',')
      queryset = queryset.filter(original_language__id__in=languages).distinct()
    if 'price' in filters:
      price_types = filters['price'].split(',')
      price_filter = Q()
      for type in price_types:
        price_filter |= Q(streaming_services__type=type)
      queryset = queryset.filter(price_filter).distinct()

    if 'sort' in filters:
      sort_direction = filters['sort_direction']
      if sort_direction == 'asc':
        queryset = queryset.order_by(filters['sort'])
      else:
        queryset = queryset.order_by('-' + filters['sort'])


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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getWatchedMovies(request):
  user = request.user
  watched_movies = WatchedMovie.objects.filter(user=user)
  serializer = WatchedMovieSerializer(watched_movies, many=True)
  return Response(serializer.data)

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
def isWatchedMovie(request, pk):
  isWatched = 0
  rating = None
  user = request.user
  watched_movies = WatchedMovie.objects.filter(user=user)
  queryset = watched_movies.filter(movie=pk)
  if len(queryset) > 0:
    isWatched = 1
    rating = queryset[0].rating
  return Response({"isWatched": isWatched, "rating": rating}, status=status.HTTP_200_OK)

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