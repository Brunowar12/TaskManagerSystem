# Generated by Django 5.1.2 on 2024-11-27 23:40

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_alter_user_phone_number_alter_user_place_of_work'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='name',
            field=models.CharField(max_length=20, validators=[django.core.validators.RegexValidator('^[a-zA-Z0-9_.-]+$', 'The category name can contain only letters, numbers, underscores periods and hyphens')]),
        ),
        migrations.AlterField(
            model_name='user',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15, validators=[django.core.validators.RegexValidator('^\\+\\d+$', "The phone number must start with '+' and contain only digits after it")], verbose_name='phone number'),
        ),
        migrations.AlterField(
            model_name='user',
            name='place_of_work',
            field=models.CharField(blank=True, max_length=256, validators=[django.core.validators.RegexValidator('^[a-zA-Z0-9_. -]+$', 'Place of work can only contain letters, numbers, underscores, dots, dashes and spaces')], verbose_name='place of work'),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=80, unique=True, validators=[django.core.validators.RegexValidator('^[a-zA-Z0-9_.-]+$', 'The username can contain only letters, numbers, underscores, periods and hyphens')], verbose_name='username'),
        ),
    ]
