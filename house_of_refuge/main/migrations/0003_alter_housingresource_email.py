# Generated by Django 3.2.12 on 2022-02-27 22:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_auto_20220227_1759'),
    ]

    operations = [
        migrations.AlterField(
            model_name='housingresource',
            name='email',
            field=models.EmailField(max_length=254),
        ),
    ]
