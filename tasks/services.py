class TaskService:
    @staticmethod
    def is_today_filter(request):
        today = request.query_params.get("today")
        return today and today.lower() == "true"
    
    @staticmethod
    def toggle_favorite(task):
        task.is_favorite = not task.is_favorite
        task.save()