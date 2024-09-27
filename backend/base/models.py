from django.db import models

# Create your models here.

class Genres(models.Model):
  id = models.CharField(primary_key=True, max_length=100)
  name = models.CharField(max_length= 100)

  class Meta:
    verbose_name_plural = "Genres"

class Directors(models.Model):
  name = models.CharField(primary_key=True, max_length=300)

  class Meta:
    verbose_name_plural = "Directors"

class Actors(models.Model):
  name = models.CharField(primary_key=True, max_length=300)

  class Meta:
    verbose_name_plural = "Actors"

class StreamingOptions(models.Model):
  service_id = models.CharField(max_length=30)
  name = models.CharField(max_length=30)
  homePage = models.URLField(max_length=200)
  lightThemeImage = models.ImageField()
  darkThemeImage = models.ImageField()
  whiteImage = models.ImageField()
  type = models.CharField(max_length=50)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=['id', 'type'], name='unique_streaming_type')
    ]
    verbose_name_plural = "StreamingOptions"

class Languages(models.Model):
  id = models.CharField(primary_key=True, max_length=10)
  name = models.CharField(max_length=30)

  class Meta:
    verbose_name_plural = "Languages"

class Movies(models.Model):
  id = models.IntegerField(primary_key = True)
  imdbId = models.CharField(unique=True, max_length=20)
  tmdbId = models.CharField(unique=True, max_length=20)
  title = models.CharField(max_length=100)
  overview = models.TextField(null=True)
  releaseYear = models.IntegerField()
  originalTitle = models.CharField(max_length=100, null=True)
  genres = models.ManyToManyField(Genres)
  directors = models.ManyToManyField(Directors)
  cast = models.ManyToManyField(Actors)
  image = models.ImageField()
  streamingOptions = models.ManyToManyField(StreamingOptions)
  api_rating = models.IntegerField()
  runtime = models.IntegerField(null=True)
  popularity = models.FloatField(null=True)
  original_language = models.ForeignKey(Languages, on_delete=models.CASCADE, null=True)
  vote_count = models.IntegerField(null=True)
  vote_average = models.FloatField(null=True)


  class Meta:
    verbose_name_plural = "Movies"

