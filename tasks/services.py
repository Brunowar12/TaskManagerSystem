import logging
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

class TaskService:
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
    def filter_today_tasks(queryset):
        try:
            return queryset.filter(due_date__date=now().date())
        except Exception as e:
            logger.error(f"Error filtering today's tasks: {e}")
            raise ValidationError("Error filtering today's tasks") from e
        
    @staticmethod
    def filter_by_priority(queryset, priority):
        """Фільтрувати завдання за пріоритетом"""
        if priority and priority in ['L', 'M', 'H']:
            return queryset.filter(priority=priority)
        return queryset
        
class CategoryService:
    @staticmethod
    def get_tasks_for_category(category):
        return category.tasks.all()