# Generated by Django 5.1.2 on 2024-12-03 14:53

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_alter_user_place_of_work'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='name',
            field=models.CharField(max_length=20, validators=[django.core.validators.RegexValidator('^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ0-9_. -]+$', 'Category name can contain letters (latin/cyrillic), numbers, underscores, dots, dashes, and spaces')]),
        ),
    ]