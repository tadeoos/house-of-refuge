# Generated by Django 3.2.12 on 2022-03-03 10:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0019_alter_housingresource_people_to_accommodate_raw'),
    ]

    operations = [
        migrations.AddField(
            model_name='housingresource',
            name='is_dropped',
            field=models.BooleanField(default=False),
        ),
    ]
