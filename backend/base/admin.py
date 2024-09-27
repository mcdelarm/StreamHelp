from django.contrib import admin
from .models import Movies, Directors, Actors, Genres, StreamingOptions, Languages

# Register your models here.
admin.site.register(Movies)
admin.site.register(Directors)
admin.site.register(Actors)
admin.site.register(Genres)
admin.site.register(StreamingOptions)
admin.site.register(Languages)