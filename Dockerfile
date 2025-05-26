# Use the official Python image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=TaskManagerSystem.settings

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Install static files
RUN python manage.py collectstatic --noinput

# Expose Django port
EXPOSE 8000

# Run the application with Gunicorn
CMD ["gunicorn", "TaskManagerSystem.wsgi:application", "--bind", "0.0.0.0:8000"]
