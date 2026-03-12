#Used to convert objects to JSON format
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from base.models import Movies, StreamingOptionInstance, StreamingProvider, Genres, Languages, WatchedMovie, Actor, Director, MovieActor
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from base.recommendations.recommendations import fetch_similar_movies
# from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
  @classmethod
  def get_token(cls, user):
    token = super().get_token(user)
    token['username'] = user.username
    return token

class MoviesListSerializer(ModelSerializer):
  class Meta:
    model = Movies
    fields = ['id', 'poster', 'title']
  
class ActorSerializer(ModelSerializer):
  class Meta:
    model = Actor
    fields = '__all__'

class DirectorSerializer(ModelSerializer):
  class Meta:
    model = Director
    fields = '__all__'

class MovieActorSerializer(ModelSerializer):
  id = serializers.IntegerField(source='actor.id')
  name = serializers.CharField(source='actor.name')
  profile_picture = serializers.CharField(source='actor.profile_picture', allow_null=True)
  popularity = serializers.FloatField(source='actor.popularity', read_only=True)


  class Meta:
    model = MovieActor
    fields = ['id', 'name', 'profile_picture', 'popularity', 'character', 'order']

class MovieSerializer(ModelSerializer):
  genres = serializers.SlugRelatedField(
    many=True,
    read_only=True,
    slug_field='name'
  )
  original_language = serializers.SlugRelatedField(
    read_only=True,
    slug_field='name'
  )
  cast = serializers.SerializerMethodField() #MovieActorSerializer(source='ordered_cast', many=True)
  director = DirectorSerializer(many=True)
  similar_movies = serializers.SerializerMethodField()

  class Meta:
    model = Movies
    exclude = ['original_title', 'adult', 'trailer_official', 'ratings_updated_at', 'streaming_updated_at']
  
  def get_cast(self, obj):
    top_cast = MovieActor.objects.filter(movie=obj).order_by('order')[:8]

    return [
      {
        'id': ma.actor.id,
        'name': ma.actor.name,
        'profile_picture': ma.actor.profile_picture,
        'character': ma.character,
        'order': ma.order
      }
      for ma in top_cast
    ]
  
  def get_similar_movies(self, obj):
    similar_movies = fetch_similar_movies(obj.id, top_n=8)

    return [
      {
        'id': m.id,
        'title': m.title,
        'poster': m.poster,
        'imdb_rating': m.imdb_rating,
        'release_date': m.release_date
      }
      for m in similar_movies
    ]

class StreamingProviderSerializer(ModelSerializer):
  class Meta:
    model = StreamingProvider
    fields = '__all__'



class StreamingOptionInstanceSerializer(ModelSerializer):
  provider_name = serializers.CharField(source='provider.provider_name', read_only=True)
  provider_logo = serializers.URLField(source='provider.logo')
  class Meta:
    model = StreamingOptionInstance
    fields = ['provider_name', 'provider_logo', 'movie', 'type']

class GenreSerializer(ModelSerializer):
  class Meta:
    model = Genres
    fields = '__all__'

class LanguageSerializer(ModelSerializer):
  class Meta:
    model = Languages
    fields = '__all__'
  
class WatchedMovieSerializer(ModelSerializer):
  poster = serializers.URLField(source='movie.poster')
  title = serializers.CharField(source='movie.title')
  id = serializers.CharField(source='movie.id')

  class Meta:
    model = WatchedMovie
    fields = ['poster', 'title', 'rating', 'watched_date', 'id']

class WatchedMovieCreateSerializer(serializers.ModelSerializer):
    movie_id = serializers.PrimaryKeyRelatedField(queryset=Movies.objects.all(), source='movie')

    class Meta:
        model = WatchedMovie
        fields = ['movie_id', 'watched_date']

class WatchedMovieUpdateSerializer(serializers.ModelSerializer):
  class Meta:
    model = WatchedMovie
    fields = ['rating'] #only allow updating the rating