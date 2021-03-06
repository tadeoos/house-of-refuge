# Generated by Django 3.2.12 on 2022-02-28 22:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_auto_20220227_2253'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='housingresource',
            options={'verbose_name': 'Zasób', 'verbose_name_plural': 'Zasoby'},
        ),
        migrations.AddField(
            model_name='housingresource',
            name='status',
            field=models.CharField(choices=[('new', 'Świeżak'), ('verified', 'Wiśnia'), ('processing', 'W procesie'), ('taken', 'Zajęta'), ('ignore', 'Ignoruj')], default='new', max_length=32),
        ),
    ]
