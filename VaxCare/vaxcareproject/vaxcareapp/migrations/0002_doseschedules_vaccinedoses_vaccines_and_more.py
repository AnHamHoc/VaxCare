# Generated by Django 5.2.1 on 2025-05-15 07:36

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vaxcareapp', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DoseSchedules',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active', models.BooleanField(default=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='VaccineDoses',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active', models.BooleanField(default=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=100)),
                ('dose_number', models.IntegerField()),
                ('interval_days', models.IntegerField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Vaccines',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active', models.BooleanField(default=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=100)),
                ('quantity_dose', models.IntegerField()),
                ('manufacturer', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=255)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='VaccinationRecords',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active', models.BooleanField(default=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
                ('health_note', models.TextField(null=True)),
                ('schedule', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vaxcareapp.doseschedules')),
                ('staff', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='staff_confirm', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='citizen', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='doseschedules',
            name='dose',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vaxcareapp.vaccinedoses'),
        ),
        migrations.AddField(
            model_name='vaccinedoses',
            name='vaccine',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vaxcareapp.vaccines'),
        ),
    ]
