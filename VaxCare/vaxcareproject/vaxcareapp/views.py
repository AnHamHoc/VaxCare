from gc import get_objects
from http.client import responses
from time import timezone

from cloudinary.provisioning import users
from django.shortcuts import render
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.request import Empty
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from .models import Vaccines, VaccineDoses, DoseSchedules, VaccinationRecords, User, Campaign, UserInfor, Appointment,AppointmentDetail
from . import serializers, paginators
from rest_framework.decorators import action
from .permission import IsAdminRole, IsStaffRole, IsCitizenRole
from .serializers import VaccinationRecordsSerializer, AppointmentSerializer, UserSerializer
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A5, landscape
from reportlab.lib.units import cm
from reportlab.lib import colors
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
import os
from datetime import datetime

from django.db.models.signals import post_save
from django.dispatch import receiver



# Create your views here.




class VaccineViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Vaccines.objects.all()
    serializer_class = serializers.VaccineSerializer

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
            manufacturer=request.data.get('manufacturer'),
            image=request.data.get('image')
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
            do = self.get_object().doseschedules_set.filter(active=True).all()
            return Response(serializers.DoseSchedulesSerializer(do, many=True).data, status=status.HTTP_200_OK)
        if request.method == 'POST':
            user = request.user
            if user.is_authenticated and getattr(user, 'role', '') == 'Admin':
                dose = VaccineDoses.objects.get(pk=pk)
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

    def retrieve(self, request, pk=None):
        do = DoseSchedules.objects.get(pk=pk)
        serializer = self.serializer_class(do)
        return Response(serializer.data)

class VaccinationRecordsViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = VaccinationRecords.objects.filter(active=True).all()
    serializer_class = serializers.VaccinationRecordsSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsStaffRole()]
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
            try :
                appointment_detail = AppointmentDetail.objects.get(
                    schedule= schedule,
                    appointment__user=citizen,
                    status='pending'
                )
                appointment_detail.status = 'completed'
                appointment_detail.save()
            except:
                pass
            return Response(serializers.VaccinationRecordsSerializer(re).data, status=status.HTTP_201_CREATED)
        return Response({"detail": "You don't have permission to patch orther busroute"}, status.HTTP_403_FORBIDDEN)

    def list(self, request):
        # user = request.user
        records = VaccinationRecords.objects.filter(active=True).order_by('-date')
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

    @action(detail=False, methods=['get'], url_path='all')
    def all_users(self, request):
        users = User.objects.all()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        user = User.objects.get(pk=pk)
        serializer = self.serializer_class(user)
        return Response(serializer.data)


class UserInforViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = UserInfor.objects.filter(active=True).all()
    serializer_class = serializers.UserInforSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsCitizenRole()]
        return [permissions.AllowAny()]

    def create(self, request):
        user = request.user
        if user.role == 'Citizen':
            infor = UserInfor.objects.create(user=user,
                                             height=request.data.get('height'),
                                             weight=request.data.get('weight'),
                                             birth_date=request.data.get('birth_date'))
            return Response(serializers.UserInforSerializer(infor).data, status=status.HTTP_201_CREATED)
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

    @action(methods=['get'], url_path='me', detail=False)
    def me(self, request):
        inf = UserInfor.objects.get(user=request.user, active=True)
        return Response(serializers.UserInforSerializer(inf).data, status=status.HTTP_200_OK)


class CampaignViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Campaign.objects.filter(active=True).all()
    serializer_class = serializers.CampaignSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAdminRole()]
        return [permissions.AllowAny()]

    def create(self, request):
        user = request.user
        if user.role == 'Admin':
            vaccine_id = request.data.get('vaccine')  # ID lịch tiêm

            vaccine = Vaccines.objects.get(id=vaccine_id)
            cam = Campaign.objects.create(vaccine=vaccine,
                                          location=request.data.get('location'),
                                          start_date=request.data.get('start_date'),
                                          end_date=request.data.get('end_date'),
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

    # xóa
    def destroy(self, request, *args, **kwargs):
        campaign = self.get_object()
        campaign.delete()
        return Response({"message": "Vaccine deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class AppointmentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Appointment.objects.filter(active=True).all()
    serializer_class = serializers.AppointmentSerializer

    def get_permissions(self):
        if self.action in ['create','get_queryset']:
            return [IsCitizenRole()]
        elif self.action in ['get_detail','certificate']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        queryset = Appointment.objects.filter(active=True).all()
        if user_id:
            queryset = queryset.filter(user__id=user_id)
        return queryset
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

            # gửi email
            context = {
                "user" : request.user,
                "vaccine" : vaccine,
                "schedules" : schedule_instances,
            }
            print(schedule_instances)

            text_content = render_to_string("emails/mail.txt", context)
            send_mail(
                subject="Xác nhận đặt lịch tiêm",
                message=text_content,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[request.user.email],
                fail_silently=False,
            )
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def certificate(self, request, pk=None):
        user = request.user
        try:
            appointment = Appointment.objects.get(pk=pk, user=user)
            if appointment.status == 'pending':
                return Response({"error": "Lịch tiêm chưa hoàn thành"}, status=400)

            # Đăng ký font Unicode
            font_path = os.path.join(settings.BASE_DIR, 'vaxcareapp',"static", "fonts", "EduQLDHand-Bold.ttf")
            pdfmetrics.registerFont(TTFont("EduQLDHand", font_path))

            # Tạo folder nếu chưa có
            save_dir = os.path.join(settings.MEDIA_ROOT, "certificates")
            os.makedirs(save_dir, exist_ok=True)

            # Tạo file PDF tại file_path
            filename = f"ChungNhanTiemChung{user.id}.pdf"
            file_path = os.path.join(save_dir, filename)

            p = canvas.Canvas(file_path, pagesize=landscape(A5))
            width, height = landscape(A5)

            birth_date = appointment.user.birth_date
            if isinstance(birth_date, str):
                birth_date = datetime.strptime(birth_date, "%Y-%m-%d")

            formatted_birth_date = birth_date.strftime("%d-%m-%Y")

            # Vẽ khung viền
            p.setStrokeColor(colors.black)
            p.setLineWidth(2)
            p.rect(0.5 * cm, 0.5 * cm, width - 1 * cm, height - 1 * cm)

            # Thêm logo (nếu có)
            logo_path = os.path.join(settings.BASE_DIR, 'vaxcareapp', 'static', 'image', 'vaxcare.png')
            try:
                p.drawImage(logo_path, 2 * cm, height - 4 * cm, width=3 * cm, height=3 * cm, preserveAspectRatio=True)
            except:
                pass  # Nếu không có logo thì bỏ qua

            # Tạo folder lưu certificate trong media
            save_dir = os.path.join(settings.MEDIA_ROOT, "certificates")
            os.makedirs(save_dir, exist_ok=True)

            # Đặt tên file PDF
            filename = f"ChungNhanTiemChung{user.id}.pdf"
            file_path = os.path.join(save_dir, filename)

            # Tiêu đề
            p.setFont("EduQLDHand", 20)
            p.drawCentredString(width / 2, height - 3 * cm, "GIẤY CHỨNG NHẬN TIÊM CHỦNG")

            # Nội dung
            p.setFont("EduQLDHand", 14)
            y = height - 5 * cm
            line_spacing = 1.2 * cm

            p.drawString(3 * cm, y, f"Họ tên: {appointment.user.first_name} {appointment.user.last_name}")
            y -= line_spacing

            p.drawString(3 * cm, y, f"Ngày sinh: {formatted_birth_date}")
            y -= line_spacing
            p.drawString(3 * cm, y, f"Địa chỉ: {appointment.user.address}")
            y -= line_spacing
            p.drawString(3 * cm, y, f"Vắc-xin: {appointment.vaccine.name}")
            y -= line_spacing
            p.drawString(3 * cm, y, f"Ngày cấp: {timezone.now().strftime('%d/%m/%Y')}")

            # Ký tên
            y -= 1 * line_spacing
            p.drawString(width - 8 * cm, y, "Đon vị tiêm chủng")
            p.drawImage(logo_path, width - 7 * cm, y - 3 * cm, 2.5 * cm, 2.5 * cm, preserveAspectRatio=True)

            # Kết thúc
            p.showPage()
            p.save()
            file_url = request.build_absolute_uri(os.path.join(settings.MEDIA_URL, f"certificates/{filename}"))
            return JsonResponse({"file_url": file_url})
        except Appointment.DoesNotExist:
            return Response({"error": "Không tìm thấy lịch tiêm"}, status=404)

    @action(methods=['get'], url_path='appointmentdetail', detail=True)
    def get_detail(self, request, pk):
        de = self.get_object().detail.filter(active=True).all()
        return Response(serializers.AppointmentDetailSerializer(de, many=True).data, status=status.HTTP_200_OK)


class AppointmentDetailViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = AppointmentDetail.objects.filter(active=True).all()
    serializer_class = serializers.AppointmentDetailSerializer

    def create(self, request):
        appointment_id = request.data.get('appointment')  # lấy id số từ client
        schedule_id = request.data.get('schedule')  # lấy id số từ client

        # Lấy đối tượng Appointment và DoseSchedules dựa trên id
        appointment_obj = Appointment.objects.get(id=appointment_id)
        schedule_obj = DoseSchedules.objects.get(id=schedule_id)

        # Tạo AppointmentDetail
        de = AppointmentDetail.objects.create(
            appointment=appointment_obj,
            schedule=schedule_obj,
        )
        return Response(serializers.AppointmentDetailSerializer(de).data, status=status.HTTP_201_CREATED)







