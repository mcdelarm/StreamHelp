from django.core.management.base import BaseCommand
from base.models import Movies
from django.conf import settings
import requests
from django.db.models import F
from django.utils import timezone

class Command(BaseCommand):
  #This command is used to update the movie ratings of about 1000 movies a day. The movie.ratings_updated_at field is used to update different movies each time.
  help = 'Fetches and updates the movie ratings of ~1000 movies a day'

  def handle(self, *args, **options):
    api_limit = 990
    self.update_ratings(api_limit)
  
  def update_ratings(self, api_limit):
    omdb_url = f"http://www.omdbapi.com/?apikey={settings.OMDB_API_KEY}&i="
    movies = Movies.objects.filter(imdb_id__isnull=False).order_by(F('ratings_updated_at').asc(nulls_first=True))[:api_limit]

    for movie in movies:
      response = requests.get(omdb_url + movie.imdb_id,timeout=5)
      if response.status_code == 200:
        data = response.json()
        try:
          ratings_obj = data['Ratings']
          if len(ratings_obj) == 0:
            print(f"Movie id: {movie.imdb_id} has no ratings. Deleting..")
            movie.delete()
            continue
          for rating in ratings_obj:
            if rating['Source'] == 'Internet Movie Database':
              movie.imdb_rating = float(rating['Value'].split('/')[0])
            elif rating['Source'] == 'Rotten Tomatoes':
              movie.rotten_tomatoes_rating = int(rating['Value'].rstrip('%'))
            elif rating['Source'] == 'Metacritic':
              movie.metacritic_rating = int(rating['Value'].split('/')[0])
        except:
          print(f"Movie id:{movie.imdb_id} has no ratings object. Deleting...")
          movie.delete()
          continue

        if data['imdbVotes'] and data['imdbVotes'] != 'N/A':
          movie.imdb_votes = int(data['imdbVotes'].replace(',', ''))
        movie.ratings_updated_at = timezone.now()
        movie.save()

      else:
        print(f"Error fetching ratings for id:{movie.id}")
        break
