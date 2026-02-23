from django.core.management.base import BaseCommand
from base.models import CollaborativeVector
import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from implicit.als import AlternatingLeastSquares
from sklearn.preprocessing import normalize


class Command(BaseCommand):
  help = 'Builds collaborative vectors for movies based on MovieLens user ratings'

  def handle(self, *args, **options):
    print("Loading data...")
    ratings = pd.read_csv("/app/data/ratings.csv")
    links = pd.read_csv("/app/data/links.csv")

    ratings = ratings.merge(links[['movieId', 'tmdbId']], on='movieId', how='inner')
    ratings = ratings.dropna(subset=['tmdbId'])
    ratings['tmdbId'] = ratings['tmdbId'].astype(int)

    print(f"Total ratings: {len(ratings):,}")
    print(f"Unique movies: {ratings['tmdbId'].nunique():,}")

    unique_users = ratings['userId'].unique()
    unique_movies = ratings['tmdbId'].unique()

    user_map = {uid: idx for idx, uid in enumerate(unique_users)}
    movie_map = {tmdb_id: idx for idx, tmdb_id in enumerate(unique_movies)}
    reverse_movie_map = {idx: tmdb_id for tmdb_id, idx in movie_map.items()}

    user_idx = ratings['userId'].map(user_map).values
    movie_idx = ratings['tmdbId'].map(movie_map).values
    rating_values = ratings['rating'].values

    sparse_matrix = csr_matrix(
        (rating_values, (user_idx, movie_idx)),
        shape=(len(unique_users), len(unique_movies))
    )

    print(f"Matrix: {sparse_matrix.shape}")

    print("\nTraining ALS model...")
    model = AlternatingLeastSquares(
        factors=100,
        iterations=30,
        regularization=0.01,
        random_state=42,
        calculate_training_loss=True,
    )

    model.fit(sparse_matrix, show_progress=True)

    print("\nSaving ALL embeddings...")
    CollaborativeVector.objects.all().delete()

    BATCH_SIZE = 5000
    embeddings_to_create = []
    normalized_factors = normalize(model.item_factors, norm='l2', axis=1)

    for movie_idx in range(len(unique_movies)):
        tmdb_id = reverse_movie_map[movie_idx]
        embedding = normalized_factors[movie_idx].tolist()
        
        embeddings_to_create.append(
            CollaborativeVector(
                movie_id=tmdb_id,
                embedding=embedding,
            )
        )
        
        if len(embeddings_to_create) >= BATCH_SIZE:
            CollaborativeVector.objects.bulk_create(embeddings_to_create, batch_size=BATCH_SIZE)
            embeddings_to_create = []
        
    if embeddings_to_create:
        CollaborativeVector.objects.bulk_create(embeddings_to_create, batch_size=BATCH_SIZE)

    
    total = CollaborativeVector.objects.count()
    print(f"\nDone! Saved {total:,} embeddings")
