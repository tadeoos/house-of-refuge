# Generated by Django 3.2.12 on 2022-03-19 13:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0039_auto_20220319_1432'),
    ]

    operations = [
        migrations.AddField(
            model_name='menupage',
            name='published',
            field=models.BooleanField(default=False),
        ),
    ]
