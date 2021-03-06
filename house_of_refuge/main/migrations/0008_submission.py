# Generated by Django 3.2.12 on 2022-03-01 14:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0007_housingresource_owner'),
    ]

    operations = [
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('name', models.CharField(max_length=512, verbose_name='Imię i nazwisko')),
                ('phone_number', models.CharField(max_length=128)),
                ('people', models.IntegerField()),
                ('how_long', models.IntegerField()),
                ('extra', models.TextField(max_length=2048, null=True)),
                ('languages', models.CharField(max_length=1024, null=True)),
                ('source', models.CharField(choices=[('webform', 'Strona'), ('mail', 'Email'), ('terrain', 'Zachodni'), ('other', 'Inny')], default='terrain', max_length=64)),
                ('priority', models.IntegerField(default=0)),
                ('when', models.DateTimeField(default=django.utils.timezone.now)),
                ('transport_needed', models.BooleanField(default=False)),
                ('note', models.TextField(max_length=2048, null=True)),
                ('owner', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('resource', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='main.housingresource')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
