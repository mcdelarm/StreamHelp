from django.core.management.base import BaseCommand
from django.conf import settings
from base.models import Languages, Genres
import requests

class Command(BaseCommand):
  help = 'Populates the languages table using tmdb api'

  def handle(self, *args, **options):
    self.populate_languages()
    self.populate_genres()
  
  def populate_languages(self):
    url = 'https://api.themoviedb.org/3/configuration/languages'

    headers = {
      "accept": "application/json",
      "Authorization": f"Bearer {settings.TMDB_API_KEY}"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
      json_data = response.json()
      for language_obj in json_data:
        queryset = Languages.objects.filter(id=language_obj['iso_639_1'])
        if len(queryset) == 0:
          Languages.objects.create(id=language_obj['iso_639_1'], name=language_obj['english_name'])
    else:
      print("Error fetching tmdb languages api")
      return
  
  def populate_genres(self):
    url = "https://api.themoviedb.org/3/genre/movie/list?language=en"

    headers = {
      "accept": "application/json",
      "Authorization": f"Bearer {settings.TMDB_API_KEY}"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
      json_data = response.json()
      genres = json_data['genres']
      for genre_obj in genres:
        queryset = Genres.objects.filter(id=genre_obj['id'])
        if len(queryset) == 0:
          Genres.objects.create(id=genre_obj['id'], name=genre_obj['name'].lower())
    else:
      print("Error fetching tmdb genres api")
      return

