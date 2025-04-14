import logging
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)


class TaskService:
    """
    A service for task operations
    Responsible for business logic related to tasks
    """

    @staticmethod
    def is_today_filter(request):
        today = request.query_params.get("today")
        return today and today.lower() == "true"

    @staticmethod
    def toggle_favorite(task):
        task.is_favorite = not task.is_favorite
        task.save()
        return task

    @staticmethod
    def toggle_completed(task):
        task.completed = not task.completed
        task.update_completed_at()
        task.save()
        return task
    
    @staticmethod
    def move_task_to_project(task, project_id, user):
        from projects.models import Project

        try:
            new_project = Project.objects.get(id=project_id, owner=user)
        except Project.DoesNotExist:
            raise ValueError("Project not found or access denied")

        task.project = new_project
        task.save()

        return task

    @staticmethod
    def filter_today_tasks(queryset):
        try:
            return queryset.filter(due_date__date=now().date())
        except Exception as e:
            logger.error(f"Error filtering today's tasks: {e}")
            raise ValidationError("Error filtering today's tasks") from e

    @staticmethod
    def filter_by_priority(queryset, priority):
        if priority and priority in ["L", "M", "H"]:
            return queryset.filter(priority=priority)
        return queryset


class CategoryService:
    """
    Service for operations with categories
    """

    @staticmethod
    def get_tasks_for_category(category):
        return category.tasks.all()