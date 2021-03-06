# Generated by Django 3.2.12 on 2022-03-16 20:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0036_auto_20220313_1556'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('submission_throttling', models.IntegerField(default=30, help_text='Max number of open/searching submissions. Set to 0 to disable', verbose_name='Submission Throttling')),
            ],
            options={
                'verbose_name': 'Site Configuration',
            },
        ),
    ]
