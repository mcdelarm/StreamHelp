from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
  path('', views.getRoutes),
  path('movies/', views.MovieListView.as_view()),
  path('streaming-providers/', views.getStreamingProviders),
  path('genres/', views.getGenres),
  path('languages/', views.getLanguages),
  path('streaming-options/<str:pk>/', views.getStreamingOptions),
  path('movie/<str:pk>/', views.getMovie),
  path('token/', views.MyTokenObtainPairSerializer.as_view(), name='token_obtain_pair'),
  path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
  path('watched-movies/', views.getWatchedMovies),
  path('add-watched-movie/', views.postWatchedMovie),
  path('is-watched-movie/<str:pk>/', views.isWatchedMovie),
]