from django.core.management.base import BaseCommand
from django.conf import settings
from base.models import StreamingOptionInstance, Movies, StreamingProvider
from django.utils import timezone
from django.db.models import F
import requests
import time

class Command(BaseCommand):
  help = 'Update the streaming info for movies'

  def handle(self, *args, **options):
    api_limit = 500
    self.update_streaming_options(api_limit)

  def update_streaming_options(self, api_limit):
    tmdb_headers = {
      'accept': 'application/json',
      'Authorization': f"Bearer {settings.TMDB_API_KEY}"
    }
    #Need to fetch configuration api to get the base image url for movie posters. 
    image_url = "https://api.themoviedb.org/3/configuration"
    image_response = requests.get(image_url, headers=tmdb_headers)
    if image_response.status_code == 200:
      configuration_data = image_response.json()
      image_data = configuration_data['images']
      base_url = image_data['base_url']
      file_size = 'w500'
    else:
      print("Error getting image base_url and file size")
      return
    #First prioritize updating movies with least recent streaming_options_updated_at
    movies = Movies.objects.all().order_by(F('streaming_updated_at').asc(nulls_first=True))[:api_limit]
    for movie in movies:
      streaming_url = f"https://api.themoviedb.org/3/movie/{movie.id}/watch/providers"
      response = requests.get(streaming_url, headers=tmdb_headers)
      if response.status_code == 200:
        StreamingOptionInstance.objects.filter(movie=movie).delete()
        json_data = response.json()
        results = json_data['results']
        try:
          us_options = results['US']
          keys_iter = iter(us_options)
          next(keys_iter)
          for type in keys_iter:
            for provider_obj in us_options[type]:
              queryset = StreamingProvider.objects.filter(provider_id=provider_obj['provider_id'])
              if len(queryset) == 0:
                streaming_provider = StreamingProvider.objects.create(provider_id=int(provider_obj['provider_id']), provider_name=provider_obj['provider_name'], logo=base_url + file_size + provider_obj['logo_path'])
              else:
                streaming_provider = queryset[0]
              StreamingOptionInstance.objects.create(movie=movie, provider=streaming_provider, type=type)
              movie.streaming_updated_at = timezone.now()
              movie.save()
        except:
          print(f"No streaming info available for {movie.title}. Skipping...")
          movie.streaming_updated_at = timezone.now()
          movie.save()
      else:
        print("error fetching the tmdb providers api")
        break
      time.sleep(0.25)