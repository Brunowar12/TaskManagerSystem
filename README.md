# TaskManagerSystem

TaskManagerSystem is a feature-rich, web-based task management application built with Django and Next.js. It allows users to create, update, and manage tasks with advanced features like search, filtering and sorting. The system supports authentication and authorization, ensuring a personalized and secure experience

## Features

- **User Authentication:**
  - Register and log in with email and password
  - Secure token-based authentication using JWT
  
- **Task Management:**
  - Create, view, update, and delete tasks
  - Set due dates and priorities (Low, Medium, High)
  - Mark tasks as complete or mark them as favorites

- **Search and Filtering:**
  - Search tasks by title and description
  - Filter tasks by status (Completed, Incomplete) and priority (Low, Medium, High)
  - Sort tasks by title, due date, and favorites (starred tasks)

- **Category Management:**
  - Organize tasks into categories
  - Add and delete categories

- **Responsive Frontend Integration:**
  - Built using Next.js, providing a dynamic and responsive user interface
  - Compatible with API-based communication with the Django backend

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
  - [Next.js](https://nextjs.org/) for dynamic and modern frontend
  - React, CSS, JavaScript

- **Testing and CI/CD:**
  - Unit tests for API endpoints using `pytest` and `Django TestCase`
  - GitHub Actions for continuous integration and testing

## Installation

### Prerequisites

- Python (tested >= 3.11.7 or 3.12.3)
- PostgreSQL (>= 13)
- Node.js (for working with Next.js frontend)

### Steps to Install

1. Clone the repository:

   ```bash
   git clone https://github.com/Brunowar12/TaskManagerSystem.git
   cd TaskManagerSystem
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   venv\Scripts\activate   # or use `source venv/bin/activate`
   ```

3. Install dependencies:

   ```bash
   pip install pip-tools
   pip-sync requirements.txt
   ```

4. Set up the database:
   - Update `.env` with your PostgreSQL credentials:

     ```env
     SECRET_KEY=your-secret-key
     DB_NAME=taskmanager_db
     DB_USER=your-db-username
     DB_PASSWORD=your-db-password
     DB_HOST=localhost
     DB_PORT=5432
     ```

   - Run migrations:

     ```bash
     python manage.py migrate
     ```

5. Create a superuser (for admin access):

   ```bash
   python manage.py createsuperuser
   ```

6. Collect static files:

   ```bash
   python manage.py collectstatic
   ```

7. Start the development server:

   ```bash
   python manage.py runserver
   ```

8. Install dependencies for the frontend (Next.js):

   ```bash
   cd frontend  # Navigate to the frontend directory
   npm install
   ```

9. Run the Next.js development server:

   ```bash
   npm run dev
   ```

Access the application at [http://localhost:3000](http://localhost:3000) (Next.js frontend) and [http://127.0.0.1:8000](http://127.0.0.1:8000) (Django backend)

## API Documentation

The application uses Django REST Framework. Below are some of the main API endpoints:

### **Authentication**

- `POST /auth/register/` - Register a new user
- `POST /auth/login/` - Log in and retrieve access/refresh tokens
- `POST /auth/token/refresh/` - Refresh JWT tokens

### **Tasks**

- `GET /tasks/` - List all tasks for the authenticated user
- `POST /tasks/create/` - Create a new task
- `GET /tasks/<task_id>/` - Retrieve a task by ID
- `PATCH /tasks/<task_id>/` - Update a task
- `DELETE /tasks/<task_id>/` - Delete a task

### **Categories**

- `GET /tasks/categories/` - List all categories for the authenticated user
- `POST /tasks/categories/create/` - Create a new category
- `GET /tasks/categories/<category_id>/` - Retrieve a category by ID
- `PATCH /tasks/categories/<category_id>/` - Update a category
- `DELETE /tasks/categories/<category_id>/` - Delete a category

## Testing

Run all tests with the following command:

```bash
python manage.py test api.tests
```

The CI/CD pipeline is configured with GitHub Actions. Tests are automatically run for all pull requests to the `master` branch

## Contributing

We welcome contributions to TaskManagerSystem! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your message"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---
