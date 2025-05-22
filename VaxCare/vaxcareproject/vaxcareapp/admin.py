from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse

from .models import User, UserInfor, Vaccines, VaccineDoses, VaccinationRecords, DoseSchedules,Appointment,Campaign
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
    list_display = ['id','username','phone', 'email', 'avatar','role','is_active']

class MyUserInforAdmin(admin.ModelAdmin):
    list_display = ['id','get_full_name','height','weight','birth_date']

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



# Register your models here.
admin_site.register(User, MyUserAdmin)
admin_site.register(UserInfor, MyUserInforAdmin)
admin_site.register(Vaccines, MyVaccinesAdmin)
admin_site.register(VaccineDoses, MyVaccineDosesAdmin)
admin_site.register(VaccinationRecords, MyVaccinationRecordsAdmin)
admin_site.register(DoseSchedules,MyDoseSchedulesAdmin)
admin_site.register(Appointment, MyAppointmentAdmin)
admin_site.register(Campaign)
