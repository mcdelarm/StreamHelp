from django.contrib import admin
from .models import Movies, Genres, StreamingOptionInstance, Languages, StreamingProvider

# Register your models here.
admin.site.register(Movies)
admin.site.register(Genres)
admin.site.register(StreamingProvider)
admin.site.register(Languages)
admin.site.register(StreamingOptionInstance)