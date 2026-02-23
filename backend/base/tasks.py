from celery import shared_task, chain
from django.core.mail import send_mail
from django.conf import settings
from django.core.management import call_command
from base.models import ContentBasedVector, Movies
from sentence_transformers import SentenceTransformer
from django.db import transaction

def build_overview_text(movie):
    genres = ', '.join(g.name for g in movie.genres.all())
    cast = ', '.join(a.name for a in movie.cast.all()[:5])
    directors = list(movie.director.all())
    director = ', '.join(d.name for d in directors) if directors else 'Unknown'

    return (
        f"Genres: {genres}. "
        f"Cast: {cast}. "
        f"Director: {director}. "
        f"Overview: {movie.overview}"
    )

def alert_on_failure(self, exc, task_id, args, kwargs, einfo):
    send_mail(
        subject='Hey Martin, Celery Task Failed',
        message=f'Task {task_id} failed: {exc}\nTask ID: {task_id}\nArgs: {args}\nKwargs: {kwargs}\nInfo: {einfo}',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['delarminatmartin@gmail.com'],
    )

@shared_task(bind=True, on_failure=alert_on_failure)
def populate_movies_task(self, *args, **kwargs):
    call_command("populate_movies")

@shared_task(bind=True, on_failure=alert_on_failure)
def update_ratings_task(self, *args, **kwargs):
    call_command("update_movie_ratings")

@shared_task(bind=True, on_failure=alert_on_failure)
def update_streaming_options_task(self, *args, **kwargs):
    call_command("update_streaming_options")

@shared_task(bind=True, on_failure=alert_on_failure)
def build_cb_vectors_task(self, *args, **kwargs):
    movies = Movies.objects.filter(content_based_vector__isnull=True).prefetch_related("genres", "cast", "director")
    print(f"Found {movies.count()} movies without content based vectors.")

    if not movies.exists():
        print("No movies found without content based vectors. Exiting.")
        return
    
    overview_texts = [build_overview_text(m) for m in movies]
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(overview_texts, normalize_embeddings=True)

    vectors_to_create = []
    for movie, embedding in zip(movies, embeddings):
        vectors_to_create.append(ContentBasedVector(movie_id=movie, embedding=embedding.tolist()))
    
    with transaction.atomic():
        ContentBasedVector.objects.bulk_create(vectors_to_create)
    
    print(f"Created {len(vectors_to_create)} content based vectors.")


@shared_task(bind=True, on_failure=alert_on_failure)
def run_daily_population_pipeline(self):
    chain(
        populate_movies_task.s(),
        update_ratings_task.s(),
        update_streaming_options_task.s(),
        build_cb_vectors_task.s()
    ).apply_async()