from django.template.defaultfilters import first

from .models import User, UserInfor, Vaccines, VaccineDoses, VaccinationRecords, DoseSchedules, Appointment, Campaign, AppointmentDetail
from rest_framework import serializers


class VaccineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccines
        fields = '__all__'


class VaccineDosesSerializer(serializers.ModelSerializer):
    vaccine = VaccineSerializer()

    class Meta:
        model = VaccineDoses
        fields = '__all__'


class DoseSchedulesSerializer(serializers.ModelSerializer):
    vaccine_name = serializers.CharField(source='dose.vaccine.name', read_only=True)
    dose_name = serializers.CharField(source='dose.name', read_only=True)
    class Meta:
        model = DoseSchedules
        fields = '__all__'


class VaccinationRecordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccinationRecords
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id','first_name', 'last_name', 'username', 'password', 'avatar','phone','email','birth_date','address','role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(user.password)
        user.save()

        return user


class CampaignSerializer(serializers.ModelSerializer):
    vaccine_name = serializers.CharField(source='vaccine.name', read_only=True)
    class Meta:
        model = Campaign
        fields = '__all__'


class UserInforSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfor
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    vaccine_name = serializers.CharField(source='vaccine.name', read_only=True)
    user = UserSerializer()
    class Meta:
        model = Appointment
        fields = '__all__'


class AppointmentDetailSerializer(serializers.ModelSerializer):
    schedule_date = serializers.CharField(source='schedule.date', read_only=True)
    dose_name = serializers.CharField(source='schedule.dose.name', read_only=True)
    class Meta:
        model = AppointmentDetail
        fields = '__all__'
