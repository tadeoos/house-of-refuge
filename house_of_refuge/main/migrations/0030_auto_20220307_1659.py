# Generated by Django 3.2.12 on 2022-03-07 15:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0029_alter_submission_note'),
    ]

    operations = [
        migrations.AlterField(
            model_name='housingresource',
            name='backup_phone_number',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.AlterField(
            model_name='submission',
            name='note',
            field=models.CharField(blank=True, default='', max_length=2048),
        ),
    ]