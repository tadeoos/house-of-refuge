# Generated by Django 3.2.12 on 2022-03-01 15:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0009_submission_status'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='submission',
            options={'verbose_name': 'Zgłoszenie', 'verbose_name_plural': 'Zgłoszenia'},
        ),
        migrations.AddField(
            model_name='submission',
            name='contact_person',
            field=models.CharField(max_length=1024, null=True),
        ),
    ]
