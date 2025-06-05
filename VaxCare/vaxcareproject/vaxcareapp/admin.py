from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse

from .models import User, UserInfor, Vaccines, VaccineDoses, VaccinationRecords, DoseSchedules,Appointment,Campaign, AppointmentDetail
from django.urls import path


class MyVaxCareAdminsite(admin.AdminSite):
    site_header = 'Hệ Thống Quản Lý Tiêm Chủng'

    def get_urls(self):
        return [
            path('vaxcare-stats/', self.stats_view)
        ] + super().get_urls()

    def stats_view(self, request):
        stats = (
            Appointment.objects
            .values('vaccine__name')
            .annotate(total=Count('user', distinct=True))
            .order_by('-total')
        )

        return TemplateResponse(request, 'admin/stats.html', {
            'stats': stats
        })


admin_site = MyVaxCareAdminsite(name='VaxCareManager')

class MyUserAdmin(admin.ModelAdmin):
    list_display = ['id','username','phone', 'email' ,'avatar','role','is_active']

class MyUserInforAdmin(admin.ModelAdmin):
    list_display = ['id','user_id','get_full_name','height','weight','birth_date']

    @admin.display(description='FULL NAME')
    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

class MyVaccinesAdmin(admin.ModelAdmin):
    list_display = ['id', 'name','manufacturer','quantity_dose', 'description','active']

class MyVaccineDosesAdmin(admin.ModelAdmin):
    list_display = ['id', 'vaccine','name','dose_number','interval_days','active']

class MyDoseSchedulesAdmin(admin.ModelAdmin):
    list_display = ['id','dose','date','active']

class MyAppointmentAdmin(admin.ModelAdmin):
    list_display = ['user','vaccine','status']

class MyVaccinationRecordsAdmin(admin.ModelAdmin):
    list_display = ['user','schedule', 'staff','date','health_note']

class MyAppointmentDetailAdmin(admin.ModelAdmin):
    list_display = ['get_name_user','get_name_vaccine','appointment', 'schedule','active']

    @admin.display(description='Tên Vaccine')
    def get_name_vaccine(self, obj):
        return f"{obj.appointment.vaccine.name}"

    @admin.display(description='Tên user')
    def get_name_user(self, obj):
        return f"{obj.appointment.user.first_name} {obj.appointment.user.last_name}"



# Register your models here.
admin_site.register(User, MyUserAdmin)
admin_site.register(UserInfor, MyUserInforAdmin)
admin_site.register(Vaccines, MyVaccinesAdmin)
admin_site.register(VaccineDoses, MyVaccineDosesAdmin)
admin_site.register(VaccinationRecords, MyVaccinationRecordsAdmin)
admin_site.register(DoseSchedules,MyDoseSchedulesAdmin)
admin_site.register(Appointment, MyAppointmentAdmin)
admin_site.register(AppointmentDetail, MyAppointmentDetailAdmin)
admin_site.register(Campaign)
