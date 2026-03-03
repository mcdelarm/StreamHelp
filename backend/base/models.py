from django.db import models
from django.contrib.auth.models import User
from pgvector.django import VectorField

# Create your models here.
class Actor(models.Model):
  id = models.IntegerField(primary_key=True)
  name = models.CharField(max_length=100)
  profile_picture = models.URLField(blank=True, null=True)
  popularity = models.FloatField()

  class Meta:
    verbose_name_plural = 'Actors'

class Director(models.Model):
  id = models.IntegerField(primary_key=True)
  name = models.CharField(max_length=100)
  profile_picture = models.URLField(blank=True, null=True)
  popularity = models.FloatField()

  class Meta:
    verbose_name_plural = 'Directors'

class Genres(models.Model):
  id = models.CharField(primary_key=True, max_length=100)
  name = models.CharField(max_length= 100)

  class Meta:
    verbose_name_plural = "Genres"
  
  def save(self, *args, **kwargs):
    if self.name:
      self.name = self.name.lower()
    super().save(*args, **kwargs)

class StreamingProvider(models.Model):
  provider_id = models.IntegerField(primary_key=True)
  provider_name = models.CharField(max_length=100)
  logo = models.ImageField()

  class Meta:
    verbose_name_plural = "StreamingProviders"

class Languages(models.Model):
  id = models.CharField(primary_key=True, max_length=10)
  name = models.CharField(max_length=30)

  class Meta:
    verbose_name_plural = "Languages"

class Movies(models.Model):
  id = models.IntegerField(primary_key = True)
  imdb_id = models.CharField(max_length=20, null=True)
  title = models.CharField(max_length=100)
  overview = models.TextField(null=True)
  release_date = models.DateField()
  original_title = models.CharField(max_length=100, null=True)
  genres = models.ManyToManyField(Genres)
  poster = models.URLField()
  runtime = models.IntegerField(null=True, blank=True)
  popularity = models.FloatField(null=True)
  original_language = models.ForeignKey(Languages, on_delete=models.CASCADE, null=True)
  vote_count = models.IntegerField(null=True)
  imdb_votes = models.IntegerField(null=True)
  vote_average = models.FloatField(null=True)
  imdb_rating = models.FloatField(null=True)
  rotten_tomatoes_rating = models.IntegerField(null=True)
  metacritic_rating = models.IntegerField(null=True)
  adult = models.BooleanField(null=True)
  trailer_key = models.CharField(max_length=20, null=True)
  trailer_site = models.CharField(max_length=50, null=True)
  trailer_official = models.BooleanField(null=True)
  ratings_updated_at = models.DateTimeField(null=True)
  streaming_updated_at = models.DateTimeField(null=True, blank=True)
  cast = models.ManyToManyField(Actor, through='MovieActor', related_name='movies')
  director = models.ManyToManyField(Director, related_name='movies')

  class Meta:
    verbose_name_plural = "Movies"

class StreamingOptionInstance(models.Model):
  provider = models.ForeignKey(StreamingProvider, on_delete=models.CASCADE)
  movie = models.ForeignKey(Movies, on_delete=models.CASCADE, related_name='streaming_services')
  type =  models.CharField(max_length=100)

  class Meta:
    # constraints = [
    #   models.UniqueConstraint(fields=['provider', 'movie'], name='unique_streaming_type')
    # ]
    verbose_name_plural = "StreamingOptions"

class WatchedMovie(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  movie = models.ForeignKey(Movies, on_delete=models.CASCADE)
  watched_date = models.DateTimeField(null=True, blank=True)
  rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)

  class Meta:
    unique_together = ('user', 'movie')

  def __str__(self):
    return f"{self.user.username} - {self.movie.title}"

class MovieActor(models.Model):
  movie = models.ForeignKey(Movies, on_delete=models.CASCADE)
  actor = models.ForeignKey(Actor, on_delete=models.CASCADE)
  character = models.CharField(max_length=500, null=True, blank=True)
  order = models.IntegerField(default=0)

class CollaborativeVector(models.Model):
  movie_id = models.IntegerField(primary_key=True)
  embedding = VectorField(dimensions=100)

class ContentBasedVector(models.Model):
  movie_id = models.OneToOneField(Movies, on_delete=models.CASCADE ,primary_key=True, related_name='content_based_vector')
  embedding = VectorField(dimensions=384)

class PopulateMoviesRun(models.Model):
  completed_at = models.DateTimeField(auto_now_add=True)
  completed = models.BooleanField(default=False)
  starting_page_number = models.IntegerField()
  endpoint = models.CharField(max_length=20)
  error = models.TextField(null=True, blank=True)