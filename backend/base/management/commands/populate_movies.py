from django.core.management.base import BaseCommand
from django.conf import settings
from base.models import Movies, Genres, Languages, Actor, Director, MovieActor
import requests, random
import time

class Command(BaseCommand):
  help = 'Fetches top rated movies from tmdb api'

  def handle(self, *args, **options):
    api_limit = 20
    start_page = random.randint(1, 300)
    self.populate_top_movies(api_limit, start_page)

  def populate_top_movies(self, call_limit, start_page):
    page_number = start_page
    end_page = start_page + call_limit - 1
    tmdb_headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {settings.TMDB_API_KEY}"
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
    
    top_rated_url = f"https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&sort_by=vote_average.desc&vote_count.gte=250&watch_region=US"
    popularity_url = f"https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&vote_count.gte=150&watch_region=US"
    vote_count_url = f"https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&sort_by=vote_count.desc&vote_count.gte=150&watch_region=US"
    choices = ['popularity', 'top_rated', 'vote_count']
    weights = [0.6, 0.35, 0.05]
    random_choice = random.choices(choices, weights=weights, k=1)[0]
    if random_choice == 'popularity':
      print("Popularity api!")
      random_url = popularity_url
    elif random_choice == 'top_rated':
      print("Top rated api!")
      random_url = top_rated_url
    else:
      random_url = vote_count_url
      print("Vote count api!")

    while (page_number <= end_page):
      response = requests.get(random_url + f"&page={page_number}", headers=tmdb_headers)
      if response.status_code == 200:
        #Request status is good
        json_data = response.json()
        results = json_data['results']
        for movie_obj in results:
          movie_id = movie_obj['id']
          queryset = Movies.objects.filter(id=movie_id)
          if len(queryset) == 0:
            #Movie does not exist in database - need to create. First get the imdb_id and runtime
            detail_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
            response = requests.get(detail_url, headers=tmdb_headers)
            if response.status_code == 200:
              json_data = response.json()
              if json_data['runtime']:
                runtime = json_data['runtime']
              else:
                print(f"{movie_obj['title']} has no runtime information. Not adding to the db")
                continue
              if json_data['imdb_id']:
                imbdb_id = json_data['imdb_id']
              else:
                print(f"{movie_obj['title']} has no imdb id. Not adding to the db")
                continue
            else:
              #detail request is bad
              print(f"Error fetching the tmdb details api for movie id:{movie_id}")
              break

            if not movie_obj['poster_path']:
              print(f"{movie_obj['title']} has no poster path. Not adding to the db.")
              continue
            
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
                                  runtime=runtime,
                                  imdb_id=imbdb_id,
                                  original_language=original_language
                                  )
            genre_obj = movie_obj['genre_ids']
            for genre_id in genre_obj:
              genre = Genres.objects.get(id=genre_id)
              movie.genres.add(genre)
            
            #Need to retrieve the cast when first creating movie
            cast_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits?language=en-US"
            response = requests.get(cast_url, headers=tmdb_headers)
            if response.status_code == 200:
              json_data = response.json()
              cast_list = json_data['cast']
              for default_order, actor_obj in enumerate(cast_list):
                profile_path = actor_obj['profile_path']
                full_profile_url = f"{base_url}{file_size}{profile_path}" if profile_path else None
                actor, created = Actor.objects.get_or_create(id=actor_obj['id'],defaults={'name': actor_obj['name'], 'popularity': actor_obj['popularity'], 'profile_picture':full_profile_url})
                MovieActor.objects.create(
                  movie=movie,
                  actor=actor,
                  character=actor_obj.get('character', None),
                  order=actor_obj.get('order', default_order)
                )
              crew_list = json_data['crew']
              directors = [person for person in crew_list if person['job'] == 'Director']
              if len(directors) == 0:
                print(f"No director information for {movie.title}")
              for director_obj in directors:
                profile_path = director_obj['profile_path']
                full_profile_url = f"{base_url}{file_size}{profile_path}" if profile_path else None
                director, created = Director.objects.get_or_create(id=director_obj['id'],defaults={'name': director_obj['name'], 'popularity': director_obj['popularity'], 'profile_picture': full_profile_url})
                movie.director.add(director)
                  
            else:
              print(f"Error fetching the credits api for movie id:{movie_id}")
              break
            movie.save()


          else:
            #Movie already exists in database - need to update fields
            movie = Movies.objects.get(id=movie_id)
            movie.popularity = movie_obj['popularity']
            movie.vote_average = movie_obj['vote_average']
            movie.vote_count = movie_obj['vote_count']
            movie.save()
            
          #Update the movie trailer
          if not movie.trailer_key or not movie.trailer_official:
            video_url = f"https://api.themoviedb.org/3/movie/{movie_id}/videos"
            response = requests.get(video_url, headers=tmdb_headers)
            if response.status_code == 200:
              json_data = response.json()
              results = json_data['results']
              for video_obj in results:
                if video_obj['type'] == 'Trailer':
                  if not movie.trailer_key or video_obj['official']:
                    movie.trailer_key = video_obj['key']
                    movie.trailer_site = video_obj['site']
                    if video_obj['official']:
                    #stop searching for trailer once you find the offical one
                      movie.trailer_official = True
                      break
              if not movie.trailer_key:
                print(f"{movie.title} has no trailer information.")
              movie.save()
            else:
              print("Error fetching the tmdb video api")
              break
      else:
        #Request status is bad
        print(f"Error fetching the tmdb api, status code: {response.status_code}")
        break
      page_number += 1
      time.sleep(0.25)