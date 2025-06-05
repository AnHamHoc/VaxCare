from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models
from ckeditor.fields import RichTextField

# Create your models here.

class User(AbstractUser):
    # phần quyền người dùng
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Staff' ,'Staff'),
        ('Citizen', 'Citizen')
    ]
    # Giới tính
    GENDER_CHOICES = [
        ('Nam', 'Nam'),
        ('Nữ', 'Nữ'),
    ]
    # vai trò
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Citizen')
    # Sô điện thoại
    phone = models.CharField(max_length=20, null=True, unique=True)
    # Địa chỉ
    address = models.CharField(max_length=255, null=True)
    birth_date = models.DateField(null=True, blank=True)
    # Ảnh đại diện
    avatar = CloudinaryField(null=True)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)


    class Meta:
        abstract = True

class UserInfor(BaseModel):
    # mối quan hệ 1 - 1 với một tài khoản
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    # thuộc tính
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.user}'

class Vaccines(BaseModel):
    name = models.CharField(max_length=100, null=False) # tên liều
    quantity_dose = models.IntegerField(null=False) # số lượng liều cần tiêm
    manufacturer = models.CharField(max_length=100, null=False) # nhà sản xuất
    description = models.CharField(max_length=255, null=False) # miêu tả
    image = CloudinaryField(null=True)

    def __str__(self):
        return self.name

class VaccineDoses(BaseModel):
    # mối quan hệ 1 - n với vacxin
    vaccine = models.ForeignKey(Vaccines, on_delete=models.CASCADE)
    #thuộc tính
    name = models.CharField(max_length=100, null=False) # tên mũi vd: mũi 1
    dose_number = models.IntegerField(null=False) # mũi thứ mấy
    interval_days =models.IntegerField(null=False) # khoảng cách ngày cần tym mũi tiếp theo

    def __str__(self):
        return f'{self.name} ({self.vaccine.name})'

class DoseSchedules(BaseModel):
    # quan hệ 1 - n với liều vac xin
    dose = models.ForeignKey(VaccineDoses, on_delete=models.CASCADE)
    #thuộc tính
    date = models.DateField(null=False) # ngày tiêm

    def __str__(self):
        return f'{self.dose.name} ({self.dose.vaccine.name}) - {self.date.strftime("%d/%m/%Y")}'

class VaccinationRecords(BaseModel): # lich sử tiêm
    # quan hệ 1 - n với user
    user = models.ForeignKey(User, on_delete=models.CASCADE,related_name='citizen')
    # quan hệ 1 - n với ngày tiêm
    schedule = models.ForeignKey(DoseSchedules, on_delete=models.CASCADE)
    # quan hệ 1 - n với nhân viên y tế
    staff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,related_name='staff_confirm')
    date = models.DateField(null=False)
    health_note = RichTextField(null=True)


class Appointment(BaseModel): # đặt lịch
    STATUS_CHOICES = (
        ('pending', 'Pending'),#chờ
        ('completed', 'Completed'),#hoàn thành
    )
    user = models.ForeignKey(User, related_name='appointments', on_delete=models.CASCADE)
    vaccine = models.ForeignKey(Vaccines, on_delete=models.CASCADE)
    status = models.CharField(choices=STATUS_CHOICES, default='pending', max_length=20)

class AppointmentDetail(BaseModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),  # chờ
        ('completed', 'Completed'),  # hoàn thành
    )
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='detail')
    schedule = models.ForeignKey(DoseSchedules, on_delete=models.CASCADE)
    status = models.CharField(choices=STATUS_CHOICES, default='pending', max_length=20)

    class Meta:
        unique_together = ('appointment', 'schedule')


class Campaign(BaseModel): # tiêm chủng cộng đồng
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=255)
    vaccine = models.ForeignKey(Vaccines, on_delete=models.CASCADE, related_name="campaigns")

    def __str__(self):
        return f"{self.name} ({self.vaccine.name})"





