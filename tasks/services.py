import logging
from django.db.models import Q

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
            new_project = (
                Project.objects.filter(
                    Q(id=project_id)
                    & (Q(owner=user) | Q(memberships__user=user))
                )
                .distinct()
                .get()
            )
        except Project.DoesNotExist:
            raise ValueError("Project not found or access denied")

        task.project = new_project
        task.save()

        return task

class CategoryService:
    """
    Service for operations with categories
    """

    @staticmethod
    def get_tasks_for_category(category):
        return category.tasks.all()
