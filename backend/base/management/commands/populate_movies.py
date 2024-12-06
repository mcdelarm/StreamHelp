from django.core.management.base import BaseCommand
from base.models import Movies, Genres, Languages, StreamingOptionInstance, StreamingProvider
import requests


class Command(BaseCommand):
  help = 'Fetches top rated movies from tmdb api'

  def handle(self, *args, **options):
    api_limit = 10
    self.populate_top_movies(api_limit)

  def populate_top_movies(self, call_limit):
    page_number = 1
    tmdb_headers = {
    "accept": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YTkyMTJhZDExMTM3ZDlmOWMzMzg4NjExZmFlMTBlMSIsIm5iZiI6MTcyODA3OTAyNy4xODAxOTcsInN1YiI6IjY2ZjFjNWM2MDMxNWI5MWY0NjNiMzJjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tCN1ZwS89PqvNtTu74iu1mm3oTWAiwpr22383btevnw"
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

    while (page_number <= call_limit):
      tmdb_url = f"https://api.themoviedb.org/3/movie/top_rated?language=en-US&page={page_number}&region=US"
      response = requests.get(tmdb_url, headers=tmdb_headers)
      if response.status_code == 200:
        #Request status is good
        json_data = response.json()
        results = json_data['results']
        for movie_obj in results:
          queryset = Movies.objects.filter(id=movie_obj['id'])
          if len(queryset) == 0:
            #Movie does not exist in database - need to create
            original_language = Languages.objects.get(id=movie_obj['original_language'])
            movie = Movies.objects.create(id=movie_obj['id'],
                                  adult=movie_obj['adult'],
                                  original_title=movie_obj['original_title'],
                                  overview=movie_obj['overview'],
                                  popularity=movie_obj['popularity'],
                                  release_date=movie_obj['release_date'],
                                  poster=base_url + file_size + movie_obj['poster_path'],
                                  title=movie_obj['title'],
                                  vote_average=movie_obj['vote_average'],
                                  vote_count=movie_obj['vote_count'],
                                  original_language=original_language
                                  )
            genre_obj = movie_obj['genre_ids']
            for genre_id in genre_obj:
              genre = Genres.objects.get(id=genre_id)
              movie.genres.add(genre)

          else:
            #Movie already exists in database - need to update fields
            movie = Movies.objects.get(id=movie_obj['id'])
            movie.popularity = movie_obj['popularity']
            movie.vote_average = movie_obj['vote_average']
            movie.vote_count = movie_obj['vote_count']
            movie.save()

          rating_url = f"https://api.themoviedb.org/3/movie/{movie_obj['id']}/watch/providers"
          response = requests.get(rating_url, headers=tmdb_headers)
          if response.status_code == 200:
            #Remove all streaming instances of this move and refill
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
            except:
              print(f"No streaming info available for {movie_obj['title']}. Deleting this movie.")
              movie.delete()

          else:
            #Rating api failed
            print("Error fetching the tmdb rating api")
            break
      
      else:
        #Request status is bad
        print("Error fetching the tmdb api")
        break
      page_number += 1