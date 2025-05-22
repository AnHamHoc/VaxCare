from rest_framework.pagination import PageNumberPagination

class VaccinesPaginator(PageNumberPagination):
    page_size = 5

class VaccineDosesPaginator(PageNumberPagination):
    page_size = 10