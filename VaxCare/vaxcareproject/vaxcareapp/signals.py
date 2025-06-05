from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import AppointmentDetail, Appointment

@receiver(post_save, sender=AppointmentDetail)
def update_appointment_status(sender, instance, **kwargs):
    appointment = instance.appointment

    # Kiểm tra xem tất cả các chi tiết đã hoàn thành chưa
    all_completed = appointment.detail.all().filter(status='completed').count() == appointment.detail.count()

    if all_completed:
        appointment.status = 'completed'
        appointment.save()