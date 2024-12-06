from django.core.management.base import BaseCommand
from base.models import StreamingOptions, Movies
from serpapi import GoogleSearch
from django.utils import timezone

class Command(BaseCommand):
  help = 'Update the streaming info for movies'

  def handle(self, *args, **options):
    api_limit = 90
    self.update_streaming_options(api_limit)

  def update_streaming_options(self, api_limit):
    #First prioritize updating movies with empty streaming options fields and then update the movies that were last updated.
    null_updated_movies = Movies.objects.filter(streaming_updated_at__isnull=True).order_by('-vote_count')[:api_limit]
    remaining_calls = api_limit - null_updated_movies.count()

    if remaining_calls > 0:
      least_recent_updated_movies = Movies.objects.filter(streaming_updated_at__isnull=False).order_by('streaming_updated_at')[:remaining_calls]
    else:
      least_recent_updated_movies = Movies.objects.none()
    
    movies_to_update = list(null_updated_movies) + list(least_recent_updated_movies)

    SERPAPI_KEY = '691986edba9c7f25864bae723e969a468e753ac2088e17da4832ba4cf44a5789'

    params = {
      "location": "United States",
      "hl": "en",
      "gl": "us",
      "api_key":  SERPAPI_KEY
    }


    for movie in movies_to_update:
      params['q'] = f"{movie.title} watch online"
      search = GoogleSearch(params)
      results = search.get_dict()
      try:
        available_on = results['available_on']
        for streaming_obj in available_on:
          queryset = StreamingOptions.objects.filter(name=streaming_obj['name'], movie=movie)
          if len(queryset) == 0:
            StreamingOptions.objects.create(name=streaming_obj['name'], movie=movie, link=streaming_obj['link'], thumbnail=streaming_obj['thumbnail'], price=streaming_obj['price'])
          else:
            StreamingOptions.objects.filter(name=streaming_obj['name'], movie=movie).update(link=streaming_obj['link'], price=streaming_obj['price'])
      except:
        print(f"No available_on data for this movie: {movie.title}")
      movie.streaming_updated_at = timezone.now()
      movie.save()