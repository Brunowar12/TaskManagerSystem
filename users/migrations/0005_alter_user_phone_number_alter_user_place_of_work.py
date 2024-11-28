# Generated by Django 5.1.2 on 2024-11-27 20:09

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_alter_category_options_alter_category_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15, validators=[django.core.validators.RegexValidator('^[a-zA-Z0-9_.-]+$', 'Title can only contain letters, numbers, underscores, dots, and dashes')], verbose_name='phone number'),
        ),
        migrations.AlterField(
            model_name='user',
            name='place_of_work',
            field=models.CharField(blank=True, max_length=256, validators=[django.core.validators.RegexValidator('^[a-zA-Z0-9_.-]+$', 'Title can only contain letters, numbers, underscores, dots, and dashes')], verbose_name='place of work'),
        ),
    ]
