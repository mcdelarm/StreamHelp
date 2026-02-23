from django.contrib import admin
from .models import Movies, Genres, StreamingOptionInstance, Languages, StreamingProvider, Actor, Director, MovieActor, WatchedMovie, ContentBasedVector, CollaborativeVector

class EmptyDirectorsFilter(admin.SimpleListFilter):
  title = 'Directors empty?'
  parameter_name = 'directors_empty'

  def lookups(self, request, model_admin):
    return [
      ('yes', 'Yes (no directors)'),
      ('no', 'No (has directors)')
    ]
  
  def queryset(self, request, queryset):
    if self.value() == 'yes':
      return queryset.filter(director__isnull=True).distinct()
    if self.value() == 'no':
      return queryset.exclude(director__isnull=True).distinct()
    return queryset

class EmptyCastFilter(admin.SimpleListFilter):
    title = 'Cast empty?'
    parameter_name = 'cast_empty'

    def lookups(self, request, model_admin):
        return [
            ('yes', 'Yes (no cast)'),
            ('no', 'No (has cast)'),
        ]

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(cast__isnull=True).distinct()
        if self.value() == 'no':
            return queryset.exclude(cast__isnull=True).distinct()
        return queryset

class NullFieldFilter(admin.SimpleListFilter):
   parameter_name = None
   title = None
   field_name = None

   def lookups (self, request, model_admin):
      return [
         ('yes', 'Yes (is null)'),
         ('no', 'No (not null)')
      ]
   
   def queryset(self, request, queryset):
      if self.value() == 'yes':
         return queryset.filter(**{f"{self.field_name}__isnull":True})
      if self.value() == 'no':
         return queryset.filter(**{f"{self.field_name}__isnull": False})
      return queryset

class IMDbIDNullFilter(NullFieldFilter):
    title = 'IMDb ID is null?'
    parameter_name = 'imdb_id_null'
    field_name = 'imdb_id'

class IMDbRatingNullFilter(NullFieldFilter):
    title = 'IMDb rating is null?'
    parameter_name = 'imdb_rating_null'
    field_name = 'imdb_rating'

class TrailerKeyNullFilter(NullFieldFilter):
    title = 'Trailer key is null?'
    parameter_name = 'trailer_key_null'
    field_name = 'trailer_key'
   

class MovieAdmin(admin.ModelAdmin):
   list_filter = (
      EmptyDirectorsFilter, 
      EmptyCastFilter,
      IMDbIDNullFilter,
      IMDbRatingNullFilter,
      TrailerKeyNullFilter,
      )

admin.site.register(Movies, MovieAdmin)
admin.site.register(Genres)
admin.site.register(StreamingProvider)
admin.site.register(Languages)
admin.site.register(StreamingOptionInstance)
admin.site.register(Actor)
admin.site.register(Director)
admin.site.register(MovieActor)
admin.site.register(WatchedMovie)
admin.site.register(ContentBasedVector)
admin.site.register(CollaborativeVector)