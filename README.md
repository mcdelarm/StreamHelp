# StreamHelp

StreamHelp is a full-stack movie discovery and recommendation platform. It helps users discover films with advanced filters, track watched movies with personal ratings, and get personalized recommendations based on both collaborative and content-based signals.

## Key Features

- Discover movies with filters for genres, languages, streaming providers, release year, vote count, and rating.
- View rich movie detail pages including ratings, cast, directors, trailers, and streaming availability.
- Create an account, authenticate with JWT, and manage a personal watched list.
- Store personal movie ratings and use them to generate recommendations.
- Serve “similar movies” and personalized recommendation feeds using a weighted hybrid CF and CB recommendation system.
- Run a daily population pipeline that updates movies, ratings, streaming options, and embeddings.

## Tech Stack

### Backend
- Python, Django, Django REST Framework
- JWT auth via `djangorestframework-simplejwt`
- Celery for async/background jobs
- PostgreSQL + pgvector for vector similarity search
- Redis as Celery broker
- SentenceTransformers (`all-MiniLM-L6-v2`) for content embeddings
- `implicit` (Alternating Least Squares) for collaborative embeddings

### Frontend
- React 18
- React Router
- Custom filtering and feed UI components

### Infra / Ops
- Docker + Docker Compose
- Nginx serving React static build and proxying `/api/` to Django
- Gunicorn for Django app serving

## Project Structure

- `frontend/` — React application
- `backend/` — Django API, models, recommendation logic, Celery tasks
- `nginx/` — Nginx config and production Dockerfile for static frontend serving
- `docker-compose.yml` — local/dev compose setup
- `docker-compose.prod.yml` — production compose setup using prebuilt images

## API Highlights

Base path: `/api/`

- `GET /movies/` — filtered/paginated movie listing
- `GET /movie/<id>/` — movie detail
- `GET /streaming-options/<id>/` — movie streaming providers
- `POST /token/`, `POST /token/refresh/` — auth
- `GET /watched-movies/`, `POST /add-watched-movie/`, `PATCH /update-watched-movie/<id>/` -manage user movie ratings
- `GET /recommended-movies/`, `GET /similar-movies/<id>/` -recommendation system

## Local Development

### 1) Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin)
- A `.env` file in project root with required environment variables

### 2) Start services

```bash
docker compose up --build
```

App endpoints:
- Frontend (via Nginx): `http://localhost`
- Backend API (direct): `http://localhost:8000/api/`

### 3) Run migrations (first run / schema updates)

```bash
docker compose run --rm backend python manage.py migrate
```

## Deployment

StreamHelp supports image-based production deployment.

### Build and push images

Typical images:
- `streamhelp-backend`
- `streamhelp-nginx`

Example flow:

```bash
docker compose build backend nginx
docker tag <local-backend-image> <dockerhub-user>/streamhelp-backend:latest
docker tag <local-nginx-image> <dockerhub-user>/streamhelp-nginx:latest
docker push <dockerhub-user>/streamhelp-backend:latest
docker push <dockerhub-user>/streamhelp-nginx:latest
```

### Deploy on server

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml run --rm backend python manage.py migrate
```

Production compose uses:
- prebuilt Docker Hub images for app services
- Redis and pgvector official images
- persistent Postgres volume mounted at `/var/lib/postgresql`

## Background Pipeline

Daily pipeline task:
- `base.tasks.run_daily_population_pipeline`

This chains:
- `populate_movies`
- `update_movie_ratings`
- `update_streaming_options`
- content-based vector generation

Example manual trigger (use cron job for automated scheduling):

```bash
docker exec streamhelp_backend celery -A backend call myapp.tasks.run_daily_population_pipeline
```

## Collaborative Vectors (MovieLens + Implicit ALS)

StreamHelp builds collaborative movie embeddings using the `implicit` library’s `AlternatingLeastSquares` model.

Implementation details:
- Command: `backend/base/management/commands/build_collab_vectors.py`
- Input datasets: MovieLens `ratings.csv` and `links.csv` (accessed from https://grouplens.org/datasets/movielens/ and stored locally)
- Join strategy: MovieLens `movieId` is mapped to TMDB IDs via `links.csv`
- Model: ALS with 100 factors, regularization, and iterative training
- Output: normalized item factors are stored in `CollaborativeVector` (`pgvector`) for TMDB movie IDs

Run it manually:

```bash
docker compose run --rm backend python manage.py build_collab_vectors
```

These collaborative vectors are blended with content-based vectors in the recommendation engine for both similar-movie and user-personalized recommendations.

## Environment Variables

Store all secrets and deployment-specific values in `.env` only (never hardcode credentials in source). Typical variables include:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `CELERY_BROKER`
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`
- `TMDB_API_KEY`, `OMDB_API_KEY` -get free api keys
