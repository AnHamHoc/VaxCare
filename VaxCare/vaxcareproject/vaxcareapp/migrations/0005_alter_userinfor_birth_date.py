# Generated by Django 5.2.1 on 2025-05-15 18:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vaxcareapp', '0004_alter_userinfor_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userinfor',
            name='birth_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
