#Used to convert objects to JSON format
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from base.models import Movies, StreamingOptionInstance, StreamingProvider, Genres, Languages, WatchedMovie
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairView):
  @classmethod
  def get_token(cls, user):
    token = super().get_token(user)
    token['username'] = user.username
    return token

class MovieSerializer(ModelSerializer):
  class Meta:
    model = Movies
    fields = '__all__'

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