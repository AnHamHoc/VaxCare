from django.urls import path, include, re_path
from rest_framework import routers
from . import views


routers = routers.DefaultRouter()
routers.register('vaccines',views.VaccineViewSet, basename='vaccines')
routers.register('vaccinedoses', views.VaccineDosesViewSet, basename='vaccinesdoses')
routers.register('doseschedules', views.DoseSchedulesViewSet, basename='doseschedules')
routers.register('vaccinationrecords', views.VaccinationRecordsViewSet, basename='vaccinationrecords')
routers.register('user', views.UserViewSet, basename='user')
routers.register('userinfor', views.UserInforViewSet, basename='userinfor')
routers.register('campaign', views.CampaignViewSet, basename='campaign')
routers.register('appointment', views.AppointmentViewSet, basename="appointment")
routers.register('appointmentdetail', views.AppointmentDetailViewSet, basename='appointmentdetail')

urlpatterns = [
    path('',include(routers.urls))
]