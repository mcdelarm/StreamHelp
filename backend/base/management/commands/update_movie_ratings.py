from django.core.management.base import BaseCommand
from base.models import Movies
from django.db.models import Avg

class Command(BaseCommand):
  help = 'Update movie ratings using weighted rating formula that balances vote average and vote count'

  def handle(self, *args, **options):
    self.update_ratings()
  
  def update_ratings(self):
    mean_vote_avg = Movies.objects.all().aggregate(Avg('vote_average'))
    mean_vote_count = Movies.objects.all().aggregate(Avg('vote_count'))
    mean_vote_avg_value = mean_vote_avg['vote_average__avg']
    mean_vote_count_value = mean_vote_count['vote_count__avg']
    print(mean_vote_count_value, mean_vote_avg_value)
    all_movies = Movies.objects.all()
    for movie in all_movies:
      weighted_rating = self.calculate_weighted_rating(movie.vote_count, mean_vote_avg_value, mean_vote_count_value, 100)
      print(movie.title, weighted_rating)
      movie.weighted_rating = weighted_rating
      movie.save()
    
  def calculate_weighted_rating(self, vote_count, vote_average, C, m):
    # Weighted rating formula
    return (vote_count / (vote_count + m)) * vote_average + (m / (vote_count + m)) * C
