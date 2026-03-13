from rest_framework.pagination import PageNumberPagination

class MoviePagination(PageNumberPagination):
  page_size = 24
  page_query_param = 'page'
  page_size_query_param = 'size'
  max_page_size = 50