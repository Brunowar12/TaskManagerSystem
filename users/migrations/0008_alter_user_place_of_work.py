# Generated by Django 5.1.2 on 2024-12-03 11:42

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_alter_user_age'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='place_of_work',
            field=models.CharField(blank=True, max_length=256, validators=[django.core.validators.RegexValidator('^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ0-9_. -]+$', 'Place of work can contain letters (latin/cyrillic), numbers, underscores, dots, dashes, and spaces')], verbose_name='place of work'),
        ),
    ]
