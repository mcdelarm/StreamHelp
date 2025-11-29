from django.core.management.base import BaseCommand
from base.models import Movies
import requests
from django.db.models import F
from django.utils import timezone

class Command(BaseCommand):
  #This command is used to update the movie ratings of about 1000 movies a day. The movie.ratings_updated_at field is used to update different movies each time.
  help = 'Fetches and updates the movie ratings of ~1000 movies a day'

  def handle(self, *args, **options):
    api_limit = 950
    self.update_ratings(api_limit)
  
  def update_ratings(self, api_limit):
    omdb_url = 'http://www.omdbapi.com/?apikey=aafd72fd&i='
    movies = Movies.objects.filter(imdb_id__isnull=False).order_by(F('ratings_updated_at').asc(nulls_first=True))[:api_limit]

    for movie in movies:
      response = requests.get(omdb_url + movie.imdb_id)
      if response.status_code == 200:
        data = response.json()
        if data['Ratings']:
          ratings_obj = data['Ratings']
          for rating in ratings_obj:
            if rating['Source'] == 'Internet Movie Database':
              movie.imdb_rating = float(rating['Value'].split('/')[0])
            elif rating['Source'] == 'Rotten Tomatoes':
              movie.rotten_tomatoes_rating = int(rating['Value'].rstrip('%'))
            elif rating['Source'] == 'Metacritic':
              movie.metacritic_rating = int(rating['Value'].split('/')[0])
        else:
          print(f"{data['title']} has no ratings object")

        if data['imdbVotes'] and data['imdbVotes'] != 'N/A':
          movie.imdb_votes = int(data['imdbVotes'].replace(',', ''))
        movie.ratings_updated_at = timezone.now()
        movie.save()

      else:
        print("Error fetching ratings")
        break
