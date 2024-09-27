from django.core.management.base import BaseCommand
from base.models import Movies, Genres, StreamingOptions, Directors, Actors, Languages
import requests
from serpapi import GoogleSearch

SERPAPI_KEY = '691986edba9c7f25864bae723e969a468e753ac2088e17da4832ba4cf44a5789'


class Command(BaseCommand):
  help = 'Fetches top rated moves from different streaming services'

  def handle(self, *args, **options):
    streaming_services = ['prime', 'disney', 'netflix', 'hbo', 'hulu']
    api_limit = 100
    calls_per_service = api_limit // len(streaming_services)

    for service in streaming_services:
      self.populate_top_movies(service, calls_per_service)

  def populate_top_movies(self, service, call_limit):
    hasMore = True
    api_call_count = 0
    url = 'https://streaming-availability.p.rapidapi.com/shows/search/filters'
    querystring = {
      "country":"us",
      "series_granularity":"show",
      "order_direction":"desc",
      "order_by":"rating",
      "genres_relation":"or",
      "output_language":"en",
      "catalogs":f"{service}.subscription, {service}.free",
      "show_type":"movie",
      }

    headers = {
      "x-rapidapi-key": "f7cb245680mshcae480ffdf42dccp1f6380jsn713b2d42b6a6",
      "x-rapidapi-host": "streaming-availability.p.rapidapi.com"
    }
    
    tmdb_headers = {
            "accept": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YTkyMTJhZDExMTM3ZDlmOWMzMzg4NjExZmFlMTBlMSIsIm5iZiI6MTcyNzM2NjcxNS41NDQzOTUsInN1YiI6IjY2ZjFjNWM2MDMxNWI5MWY0NjNiMzJjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.rdLipWOwnkrePPbCPMz2VR5_0k6RgCwmhyvgxDIhXOc"
          }
    
    while (api_call_count < call_limit and hasMore):
      response = requests.get(url, headers=headers, params=querystring)
      #If response is good
      if response.status_code == 200:
        jsonData = response.json()
        hasMore = jsonData['hasMore']
        if hasMore:
          nextCursor = jsonData['nextCursor']
        movies = jsonData['shows']
        for movie_data in movies:
          queryset = Movies.objects.filter(id=movie_data['id'])
          imageSet = movie_data['imageSet']
          verticalImages = imageSet['verticalPoster']
          if len(queryset) == 0:
            movie = Movies.objects.create(id=movie_data['id'], imdbId=movie_data['imdbId'], tmdbId=movie_data['tmdbId'], title=movie_data['title'], overview=movie_data['overview'], releaseYear=movie_data['releaseYear'], originalTitle=movie_data['originalTitle'], api_rating=movie_data['rating'], image=verticalImages['w720'])
            try:
              runtime = movie_data['runtime']
              movie.runtime = runtime
            except:
              print("Movie has no runtime field")
          else:
            Movies.objects.filter(id=movie_data['id']).update(api_rating=movie_data['rating'])
            movie = Movies.objects.get(id=movie_data['id'])
          
          #Checking Genres
          for genre_obj in movie_data['genres']:
            queryset = Genres.objects.filter(id=genre_obj['id'])
            if len(queryset) == 0:
              genre = Genres.objects.create(id=genre_obj['id'], name=genre_obj['name'])
              movie.genres.add(genre)
            else:
              genre = Genres.objects.get(id=genre_obj['id'])
              if not movie.genres.filter(id=genre_obj['id']).exists():
                movie.genres.add(genre)
          
          #Checking Director
          if len(movie_data['directors']) > 1:
            print(f"More than one director for {movie.title}")
          for director in movie_data['directors']:
            queryset = Directors.objects.filter(name=director)
            if len(queryset) == 0:
              dir = Directors.objects.create(name=director)
              movie.directors.add(dir)
            else:
              dir = Directors.objects.get(name=director)
              if not movie.directors.filter(name=director).exists():
                movie.directors.add(dir)
            
          #Checking Cast
          for actor in movie_data['cast']:
            queryset = Actors.objects.filter(name=actor)
            if len(queryset) == 0:
              act = Actors.objects.create(name=actor)
              movie.cast.add(act)
            else:
              act = Actors.objects.get(name=actor)
              if not movie.cast.filter(name=act.name).exists():
                movie.cast.add(act)
          
          #Checking streaming options
          streamingOptions = movie_data['streamingOptions']
          if len(streamingOptions) != 0:
            for option in streamingOptions['us']:
              type = option['type']
              if type == 'subscription' or type == 'free':
                serviceObj = option['service']
                queryset = StreamingOptions.objects.filter(service_id=serviceObj['id'], type=type)
                if len(queryset) == 0:
                  imageSet = serviceObj['imageSet']
                  serv = StreamingOptions.objects.create(service_id=serviceObj['id'], name=serviceObj['name'], homePage=serviceObj['homePage'], lightThemeImage=imageSet['lightThemeImage'], darkThemeImage=imageSet['darkThemeImage'], whiteImage=imageSet['whiteImage'], type=type)
                  movie.streamingOptions.add(serv)
                else:
                  if not movie.streamingOptions.filter(service_id=queryset[0].id, type=queryset[0].type).exists():
                    movie.streamingOptions.add(queryset[0])
          
          # Using tmdb API to retrieve more information about the each Movie
          tmdb_url = "https://api.themoviedb.org/3/find/tt15398776?external_source=imdb_id"
          response = requests.get(tmdb_url, headers=tmdb_headers)
          if response.status_code == 200:
            tmdbJsonData = response.json()
            tmdb_movie_data = tmdbJsonData['movie_results'][0]
            movie.popularity = tmdb_movie_data['popularity']
            movie.vote_average = tmdb_movie_data['vote_average']
            movie.vote_count = tmdb_movie_data['vote_count']
            language = Languages.objects.get(id=tmdb_movie_data['original_language'])
            if movie.original_language != language:
              movie.original_language = language
          # Break out of the loop if error retrieving tmdb API
          else:
            print("Error fetching tmbdb api")
            break

          movie.save()
          if hasMore:
            querystring['cursor'] = nextCursor
      #Break out of the loop if error retrieving the Streaming Availability API
      else:
        print(f"Failed to fetch movies from {service}")
        break
      api_call_count += 1
