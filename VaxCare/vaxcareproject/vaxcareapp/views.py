from http.client import responses

from cloudinary.provisioning import users
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.request import Empty
from rest_framework.response import Response

from .models import Vaccines, VaccineDoses, DoseSchedules, VaccinationRecords, User, Campaign, UserInfor, Appointment,AppointmentDetail
from . import serializers, paginators
from rest_framework.decorators import action
from .permission import IsAdminRole, IsStaffRole, IsCitizenRole
from .serializers import VaccinationRecordsSerializer, AppointmentSerializer


# Create your views here.

class VaccineViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Vaccines.objects.all()
    serializer_class = serializers.VaccineSerializer
    pagination_class = paginators.VaccinesPaginator

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update']:
            return [IsAdminRole()]
        elif self.action in ['get_add_vaccinedoses']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queries = self.queryset
        name = self.request.query_params.get("name")
        user = self.request.user
        if not (user.is_authenticated and getattr(user, 'role', '') == 'Admin'):
            queries = queries.filter(active=True)
        if name:
            queries = queries.filter(name__icontains=name)
        return queries

    # tạo vaccine mới
    def create(self, request):
        v = Vaccines.objects.create(
            name=request.data.get('name'),
            quantity_dose=request.data.get('quantity_dose'),
            description=request.data.get('description'),
            manufacturer=request.data.get('manufacturer')
        )
        return Response(serializers.VaccineSerializer(v).data, status=status.HTTP_201_CREATED)

    # thêm mũi vaccine và kiểm tra số lượng mũi
    @action(methods=['get', 'post'], url_path='vaccinedoses', detail=True)
    def get_add_vaccinedoses(self, request, pk):
        if request.method == 'GET':
            vaccinedoses = self.get_object().vaccinedoses_set.filter(active=True).all()
            return Response(serializers.VaccineDosesSerializer(vaccinedoses, many=True).data, status=status.HTTP_200_OK)

        if request.method == 'POST':
            user = request.user
            if user.is_authenticated and getattr(user, 'role', '') == 'Admin':
                vaccine = Vaccines.objects.get(pk=pk)
                quantity_dose_count = VaccineDoses.objects.filter(vaccine=vaccine).count()
                if quantity_dose_count >= vaccine.quantity_dose:
                    return Response(
                        {"error": "Số lượng mũi tiêm đã đủ. Không thể thêm nữa."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                v = VaccineDoses.objects.create(vaccine=vaccine,
                                                name=request.data.get('name'),
                                                dose_number=request.data.get('dose_number'),
                                                interval_days=request.data.get('interval_days'))
                return Response(serializers.VaccineDosesSerializer(v).data, status=status.HTTP_201_CREATED)

        return Response({"details": "Phương thức không được hỗ trợ"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # xóa
    def destroy(self, request, *args, **kwargs):
        vaccine = self.get_object()
        vaccine.delete()
        return Response({"message": "Vaccine deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    # cập nhật
    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        if user.role == 'Admin':
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return Response(serializer.data)
        else:
            return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)


class VaccineDosesViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = VaccineDoses.objects.filter(active=True).all()
    serializer_class = serializers.VaccineDosesSerializer
    pagination_class = paginators.VaccineDosesPaginator

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update']:
            return [IsAdminRole()]
        elif self.action in ['get_add_doseschedules']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queries = self.queryset
        vac_id = self.request.query_params.get("vac_id")
        if vac_id:
            queries = queries.filter(vaccine=vac_id)
        return queries

    @action(methods=['get', 'post'], url_path='doseschedules', detail=True)
    def get_add_doseschedules(self, request, pk):
        if request.method == 'GET':
            do = self.get_object().doseschedules_get.filter(active=True).all()
            return Response(serializers.VaccineDosesSerializer(do, many=True).data, status=status.HTTP_200_OK)
        if request.method == 'POST':
            user = request.user
            if user.is_authenticated and getattr(user, 'role', '') == 'Admin':
                dose = VaccineDoses.objects(pk=pk)
                d = DoseSchedules.objects.create(dose=dose,
                                                 date=request.data.get('date'))
                return Response(serializers.DoseSchedulesSerializer(d).data, status=status.HTTP_201_CREATED)
        return Response({"details": "Phương thức không được hỗ trợ"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # xóa
    def destroy(self, request, *args, **kwargs):
        vaccinedoses = self.get_object()
        vaccinedoses.delete()
        return Response({"message": "Vaccine deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    # cập nhật
    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        if user.role == 'Admin':
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return Response(serializer.data)
        else:
            return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)


class DoseSchedulesViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = DoseSchedules.objects.filter(active=True).all()
    serializer_class = serializers.DoseSchedulesSerializer

    def get_permissions(self):
        if self.action in ['destroy', 'update']:
            return [IsAdminRole()]
        return [permissions.AllowAny()]

    # xóa
    def destroy(self, request, *args, **kwargs):
        doseschedules = self.get_object()
        doseschedules.delete()
        return Response({"message": "Vaccine deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    # cập nhật
    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        if user.role == 'Admin':
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return Response(serializer.data)
        else:
            return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)


class VaccinationRecordsViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = VaccinationRecords.objects.filter(active=True).all()
    serializer_class = serializers.VaccinationRecordsSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsStaffRole()]
        elif self.action in ['list']:
            return [IsCitizenRole]
        return [permissions.AllowAny()]

    def create(self, request):
        user = request.user
        if user.role == 'Staff':
            citizen_id = request.data.get('user')  # ID người dân
            schedule_id = request.data.get('schedule')  # ID lịch tiêm

            citizen = User.objects.get(id=citizen_id)
            schedule = DoseSchedules.objects.get(id=schedule_id)
            re = VaccinationRecords.objects.create(schedule=schedule,
                                                   staff=user,
                                                   user=citizen,
                                                   health_note=request.data.get('health_note'),
                                                   date=request.data.get('date'))
            return Response(serializers.VaccinationRecordsSerializer(re).data, status=status.HTTP_201_CREATED)
        return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)

    def list(self, request):
        user = request.user
        if user.role != 'Citizen':
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        records = VaccinationRecords.objects.filter(user=user).order_by('-date')
        serializer = VaccinationRecordsSerializer(records, many=True)
        return Response(serializer.data)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True).all()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name']:
                    setattr(u, k, v)
                elif k.__eq__('password'):
                    u.set_password(v)

            u.save()

        return Response(serializers.UserSerializer(u).data)


class UserInforViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = UserInfor.objects.filter(active=True).all()
    serializer_class = serializers.UserInforSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsCitizenRole]
        return [permissions.AllowAny()]

    def create(self, request):
        user = request.user
        if user.role == 'Citizen':
            infor = UserInfor.objects.create(user=user,
                                             height=request.data.get('height'),
                                             weight=request.data.get('weigth'),
                                             birth_date=request.data.get('birth_date'))
            return Response(serializers.VaccinationRecordsSerializer(infor).data, status=status.HTTP_201_CREATED)
        return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)

    # cập nhật
    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        if user.role == 'Citizen':
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return Response(serializer.data)
        else:
            return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)


class CampaignViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Campaign.objects.filter(active=True).all()
    serializer_class = serializers.CampaignSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAdminRole]
        return [permissions.AllowAny()]

    def create(self, request):
        user = request.user
        if user.role == 'Admin':
            vaccine_id = request.data.get('vaccine')  # ID lịch tiêm

            vaccine = Vaccines.objects.get(id=vaccine_id)
            cam = Campaign.objects.create(vaccine=vaccine,
                                          location=request.data.get('location'),
                                          start_date=request.data.get('start_date'),
                                          end_date=request.data.get('end_start'),
                                          name=request.data.get('name'),
                                          description=request.data.get('description'))
            return Response(serializers.CampaignSerializer(cam).data, status=status.HTTP_201_CREATED)
        return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)
    # cập nhật
    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        if user.role == 'Admin':
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return Response(serializer.data)
        else:
            return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)


class AppointmentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Appointment.objects.filter(active=True).all()
    serializer_class = serializers.AppointmentSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsCitizenRole()]
        elif self.action in ['get_detail']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def create(self, request):
        user = request.user
        if user.role == 'Citizen':
            schedule_ids = request.data.get('schedule_ids', [])
            vaccine_id = request.data.get('vaccine')  # ID lịch tiêm
            vaccine = Vaccines.objects.get(id=vaccine_id)
            appointment = Appointment.objects.create(user=user,
                                           vaccine=vaccine)

            if len(schedule_ids) > 0:
                schedule_instances = []
                for schedule_id in schedule_ids:
                    schedule = DoseSchedules.objects.get(id=schedule_id)
                    schedule_instances.append(schedule)

            # Tạo các chi tiết
            for schedule in schedule_instances:
                AppointmentDetail.objects.create(
                                                appointment=appointment,
                                                schedule=schedule)
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='appointmentdetail', detail=False)
    def get_detail(self, request):
        user = request.user
        ap = Appointment.objects.filter(user=user)
        de = AppointmentDetail.objects.filter(appointment__in=ap, active=True)
        return Response(serializers.AppointmentDetailSerializer(de, many=True).data, status=status.HTTP_200_OK)


class AppointmentDetailViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = AppointmentDetail.objects.filter(active=True).all()
    serializer_class = serializers.AppointmentDetailSerializer




