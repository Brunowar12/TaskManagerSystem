# TaskManagerSystem

TaskManagerSystem is a feature-rich, web-based task management application built with Django. It allows users to create, update, and manage tasks and categories. The system supports authentication and authorization, ensuring a personalized and secure experience.

## Features

- **User Authentication:**
  - Register and log in with email and password
  - Secure token-based authentication using JWT
  
- **Task Management:**
  - Create, view, update, and delete tasks
  - Set due dates and priorities (Low, Medium, High)
  - Mark tasks as complete or mark them as favorites

- **Category Management:**
  - Organize tasks into categories
  - Add, update, and delete categories

- **Responsive Frontend Integration:**
  - Compatible with custom HTML/CSS and JavaScript frontend

- **Security:**
  - CSRF protection and secure handling of sensitive data
  - Logging for errors and system activities

## Technologies Used

- **Backend:**
  - [Django 5.1.2](https://www.djangoproject.com/)
  - [Django REST Framework](https://www.django-rest-framework.org/)
  - [PostgreSQL](https://www.postgresql.org/) for database management
  - [Python Decouple](https://pypi.org/project/python-decouple/) for environment variable management

- **Frontend:**
  - HTML, CSS, JavaScript (designed for integration with Django backend)

- **Testing and CI/CD:**
  - Unit tests for API endpoints using `pytest` and `Django TestCase`
  - GitHub Actions for continuous integration and testing
