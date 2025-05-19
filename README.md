# 🧠 TaskManagerSystem

[![Django CI](https://github.com/Brunowar12/TaskManagerSystem/actions/workflows/django.yml/badge.svg)](https://github.com/Brunowar12/TaskManagerSystem/actions/workflows/django.yml)
[![codebeat badge](https://codebeat.co/badges/1e2ea64b-07c9-48ae-aa60-2f91b7a83f53)](https://codebeat.co/projects/github-com-brunowar12-taskmanagersystem-master)
[![Coverage Status](https://coveralls.io/repos/github/Brunowar12/TaskManagerSystem/badge.svg?branch=polishing-%26-refinement)](https://coveralls.io/github/Brunowar12/TaskManagerSystem?branch=polishing-%26-refinement)

A full-featured Task and Project Management REST API built with Django and Django REST Framework. Supports task categorization, project membership with role-based access control, and invitation links.

---

## 🚀 Features

### 🔐 User Authentication

- Register/Login via email & password
- JWT-based secure authentication (`SimpleJWT`)
- Token blacklisting on logout
- Profile view & update support

### ✅ Task Management

- Create, read, update, delete tasks
- Set priority, due dates, completion & favorite flags
- Task filtering: status, priority, search, due today
- Task toggles: mark as completed / favorite
- Bulk task retrieval via project or category

### 🗂 Category Support

- Create, read, update, delete categories
- Set categories to tasks
- Filter tasks by category

### 🧱 Project & Role System

- Create and manage projects
- Built-in roles: Admin, Moderator, Member, Viewer
- Assign roles to members
- Restrict actions based on roles
- Invitation system via share links with expiration & usage limits

### 🔐 Security & Validation

- SQLi, XSS & JSON payload protection
- Custom regex validators for usernames, categories, phone numbers
- Rate-limited endpoints (optional)
- Read-only roles protected by permissions

---

## ⚙️ Tech Stack

### 🔧 Backend

- [Python 3.11+](https://www.python.org/) / [Django 5.1](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL](https://www.postgresql.org/)
- `python-decouple` for environment management
- `djangorestframework-simplejwt` for authentication
- GitHub Actions for CI with coverage enforcement

---

## 🛠 Installation

### Prerequisites

- Python >= 3.11
- PostgreSQL >= 13

### Backend Setup

```bash
git clone https://github.com/Brunowar12/TaskManagerSystem.git
cd TaskManagerSystem

python -m venv venv
source venv/bin/activate  # or venv\Scripts\Activate on Windows

pip install pip-tools
pip-sync requirements.txt
````

Create a `.env` file:

```env
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=taskmanager_db
DB_USER=your-db-user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

Run database migrations:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
python manage.py runserver
```

Visit:

- [http://127.0.0.1:8000](http://127.0.0.1:8000) for Django backend

---

## 🔑 API Documentation

### 📘 Full API Documentation

- Swagger UI: [http://127.0.0.1:8000/swagger/](http://127.0.0.1:8000/swagger/)
- ReDoc: [http://127.0.0.1:8000/redoc/](http://127.0.0.1:8000/redoc/)

### 🔐 Auth

- `POST /api/auth/register/` – Register new user
- `POST /api/auth/login/` – Log in, get tokens
- `POST /api/auth/logout/` – Logout and blacklist token
- `POST /api/auth/token/refresh/` – Refresh JWT

### 📝 Tasks

- `GET /api/tasks/` – List tasks (filters, pagination)
- `POST /api/tasks/` – Create a task
- `PATCH /api/tasks/{id}/` – Update a task
- `DELETE /api/tasks/{id}/` – Delete a task
- `POST /api/tasks/{id}/toggle-favorite/`
- `POST /api/tasks/{id}/toggle-completed/`

### 📁 Projects & Roles

- `GET /api/projects/` – List accessible projects
- `POST /api/projects/` – Create new project
- `POST /api/projects/{id}/assign_role/` – Assign role
- `POST /api/projects/{id}/generate_share_link/` – Create invitation
- `POST /api/projects/join/{token}/` – Join via link
- `DELETE /api/projects/{id}/delete-share-link/{link_id}/`

---

## ✅ Testing

Run the full test suite:

```bash
coverage run --source='.' manage.py test api.tests
coverage report -m
```

Tests cover:

- Role-based permissions
- CRUD for tasks, projects, categories
- Security checks (XSS, SQLi, payload limits)
- Share link lifecycle

GitHub Actions runs all tests and enforces 90%+ coverage.

---

## 🤝 Contributing

### Guidelines

Style guide: Follow [PEP8](https://peps.python.org/pep-0008/), use type hints and write tests.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/xyz`
3. Commit: `git commit -m "feat: added xyz"` (`feat:`, `fix:`, `test:`)
4. Push: `git push origin feature/xyz`
5. Open a pull request

---

## 📄 License

[MIT License](LICENSE.md) © 2024 Brunowar12
