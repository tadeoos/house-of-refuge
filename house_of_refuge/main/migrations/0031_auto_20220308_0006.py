# Generated by Django 3.2.12 on 2022-03-07 23:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0030_auto_20220307_1659'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='housingresource',
            name='is_ready',
        ),
        migrations.AddField(
            model_name='housingresource',
            name='got_hot',
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
    ]
