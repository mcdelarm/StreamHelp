import numpy as np
from django.db.models import F
from base.models import Movies, WatchedMovie, CollaborativeVector, ContentBasedVector
from pgvector.django import CosineDistance

def min_max_normalize(sim_dict):
  values = list(sim_dict.values())
  min_val = min(values)
  max_val = max(values)
  if max_val == min_val:
      return {k: 1.0 for k in sim_dict}
  return {k: (v - min_val) / (max_val - min_val) for k, v in sim_dict.items()}

def get_top_n_recommendations(query_cb, query_cf, query_ids, top_n, cf_weight=0.7, missing_cf_punishment=1.0):
    cb_results = ContentBasedVector.objects.exclude(movie_id__in=query_ids).annotate(similarity=1 - CosineDistance(F('embedding'), query_cb)).values_list('movie_id', 'similarity').order_by('-similarity')
    cb_similarities = dict(cb_results)
    cb_similarities = min_max_normalize(cb_similarities)

    scores = {}
    if query_cf is not None:
        cf_results = CollaborativeVector.objects.filter(movie_id__in=cb_similarities.keys()).annotate(similarity=1 - CosineDistance(F('embedding'), query_cf)).values_list('movie_id', 'similarity').order_by('-similarity')
        cf_similarities = dict(cf_results)
        cf_similarities = min_max_normalize(cf_similarities)

        for movie_id in cb_similarities:
            cb_score = cb_similarities[movie_id]
            cf_score = cf_similarities.get(movie_id, cb_score * missing_cf_punishment)
            scores[movie_id] = cf_weight * cf_score + (1 - cf_weight) * cb_score
    else:
        scores = cb_similarities

    top_ids = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
    top_movie_ids = [m_id for m_id, _ in top_ids]

    movies = Movies.objects.filter(id__in=top_movie_ids)
    id_to_movie = {m.id: m for m in movies}

    return [id_to_movie[m_id] for m_id in top_movie_ids if m_id in id_to_movie]

def fetch_similar_movies(id, top_n=5):
  try:
    query_cb = ContentBasedVector.objects.get(movie_id=id)
  except ContentBasedVector.DoesNotExist:
    raise ValueError(f"No content-based vector found for movie ID {id}")
  
  try:
    query_cf = CollaborativeVector.objects.get(movie_id=id)
  except CollaborativeVector.DoesNotExist:
    query_cf = None

  return get_top_n_recommendations(query_cb.embedding, query_cf.embedding if query_cf else None, [id], top_n)

def build_user_preference_vector(user):
  watched_movies = WatchedMovie.objects.filter(user=user, rating__isnull=False).select_related('movie')
  
  if not watched_movies.exists():
    return None, None, None
  
  cf_vectors = []
  cb_vectors = []
  cb_weights = []
  cf_weights = []
  query_ids = []

  for wm in watched_movies:
    try:
      cb_emb = ContentBasedVector.objects.get(movie_id=wm.movie.id).embedding
      cb_vectors.append(cb_emb)
      cf_emb = CollaborativeVector.objects.get(movie_id=wm.movie.id).embedding
      cf_vectors.append(cf_emb)
    except ContentBasedVector.DoesNotExist:
      raise ValueError(f"No content-based vector found for movie ID {wm.movie.id}")
    except CollaborativeVector.DoesNotExist:
      cf_emb = None
    
    query_ids.append(wm.movie.id)
    cb_weights.append(float(wm.rating))
    if cf_emb is not None:
      cf_weights.append(float(wm.rating))
  
  cb_weights = np.array(cb_weights).reshape(-1, 1)
  cf_weights = np.array(cf_weights).reshape(-1, 1)
  cb_vectors = np.array(cb_vectors)

  user_cb_vector = np.sum(cb_weights * cb_vectors, axis=0) / np.sum(cb_weights)
  user_cb_vector /= np.linalg.norm(user_cb_vector) + 1e-8

  if cf_vectors:
    cf_vectors = np.array(cf_vectors)
    user_cf_vector = np.sum(cf_weights * cf_vectors, axis=0) / np.sum(cf_weights)
    user_cf_vector /= np.linalg.norm(user_cf_vector) + 1e-8
  else:
    user_cf_vector = None
  
  return user_cb_vector, user_cf_vector, query_ids


def recommend_movies_for_user(user, top_n=10):
  
  user_cb_vector, user_cf_vector, query_ids = build_user_preference_vector(user)

  if user_cb_vector is None:
    return list(Movies.objects.order_by('-imdb_rating')[:top_n])
  
  return get_top_n_recommendations(user_cb_vector, user_cf_vector, query_ids, top_n)