# Generated by Django 3.2.12 on 2022-03-03 12:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0022_submission_finished_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='housingresource',
            name='verified',
            field=models.BooleanField(default=False),
        ),
    ]
