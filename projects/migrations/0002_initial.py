# Generated by Django 5.1.6 on 2025-04-13 15:22

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('projects', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='projects', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='projectmembership',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to='projects.project'),
        ),
        migrations.AddField(
            model_name='projectmembership',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_memberships', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='projectsharelink',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='projectsharelink',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='share_links', to='projects.project'),
        ),
        migrations.AddField(
            model_name='role',
            name='permissions',
            field=models.ManyToManyField(blank=True, to='auth.permission'),
        ),
        migrations.AddField(
            model_name='projectsharelink',
            name='role',
            field=models.ForeignKey(help_text='Role for invited user', on_delete=django.db.models.deletion.CASCADE, related_name='share_links', to='projects.role'),
        ),
        migrations.AddField(
            model_name='projectmembership',
            name='role',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='members', to='projects.role'),
        ),
        migrations.AlterUniqueTogether(
            name='projectmembership',
            unique_together={('user', 'project')},
        ),
    ]
