"""
Django settings for TaskManagerSystem project.

Generated by 'django-admin startproject' using Django 5.1.2.
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Secret Key for production
SECRET_KEY = config('SECRET_KEY', default=os.environ.get('SECRET_KEY', 'fallback-secret-key'))

# Debugging mode (change to False in production)
DEBUG = config("DEBUG", default=True, cast=bool)

# Security settings
SECURE_BROWSER_XSS_FILTER = True    # enable X-XSS-Protection
SECURE_CONTENT_TYPE_NOSNIFF = True  # enable X-Content-Type-Options
X_FRAME_OPTIONS = 'DENY'            # prevent clickjacking

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])
AUTH_USER_MODEL = 'users.User'
ADMIN_ROLE_NAMES = ["Admin",]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.test',
    'django_filters',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'users',
    'tasks',
    'projects',
    'corsheaders',
]

# List of middleware classes to use
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',            # security-related middleware
    'django.contrib.sessions.middleware.SessionMiddleware',     # session management middleware
    'django.middleware.common.CommonMiddleware',                # common middleware
    'django.middleware.csrf.CsrfViewMiddleware',                # CSRF protection middleware
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # authentication middleware
    'django.contrib.messages.middleware.MessageMiddleware',     # messaging middleware
    'django.middleware.clickjacking.XFrameOptionsMiddleware',   # clickjacking protection middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:3000",  # Allow Next.js to the client
    "http://localhost:3000",  # Additionally for other options
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = ["content-type", "authorization", "x-csrftoken"]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication'
    ],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated',],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,  # number of items per page
    'EXCEPTION_HANDLER': 'TaskManagerSystem.views.custom_exception_handler',
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer',],
    'DEFAULT_PARSER_CLASSES': ['rest_framework.parsers.JSONParser',],
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
    'UNAUTHENTICATED_USER': None,
    
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle', # not auth request
        # 'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/minute',
        # 'user': '1000/minute'
  }
}

# Simple JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME', default=15, cast=int)),     # lifetime access token
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_TOKEN_LIFETIME', default=1, cast=int)),        # lifetime refresh token
    'ROTATE_REFRESH_TOKENS': False,                     # rotate refresh tokens on each request
    'BLACKLIST_AFTER_ROTATION': True,                   # blacklist old refresh tokens after rotation
    'UPDATE_LAST_LOGIN': False,                         # dont update last login on token refresh
    'ALGORITHM': 'HS256',                               # algorithm used for signing tokens
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Database settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='taskmanager_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='admin'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Logging configuration
LOG_DIR = os.path.join(BASE_DIR, "logs")
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOGGING = {
    'version': 1,  # version of the logging configuration
    'disable_existing_loggers': False,  # dont disable existing loggers

    # define different formats for logs
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',  # detailed log format
            'style': '{',  # use '{}' for formatting
        },
        'simple': {
            'format': '{levelname} {message}',  # simple log format
            'style': '{',
        },
    },

    # define different handlers for log messages
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',  # log to the console
            'formatter': 'simple',  # use the simple formatter
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',  # log to a file
            'filename': os.path.join(LOG_DIR, 'tms.log'),
            'maxBytes': 1024 * 1024 * 5,  # rotate logs every 5MB
            'backupCount': 3,
            'formatter': 'verbose',
        },
        'error_file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'errors.log'),
            'formatter': 'verbose',
            'level': 'ERROR',  # only log ERROR and above level messages
        },
    },

    # define different loggers
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],  # use console and file handlers
            'level': 'INFO',  # log INFO and above level messages
            'propagate': True,  # propagate messages to the root logger
        },
        'django.request': {
            'handlers': ['error_file'],  # use error_file handler
            'level': 'ERROR',  # only log ERROR and above
            'propagate': False,  # dont propagate messages to the root logger
        },
        '': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',  # log WARNING and above
        },
    },
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Root URL configuration
ROOT_URLCONF = 'TaskManagerSystem.urls'

# Template configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # dir where templates are
        'APP_DIRS': True,  # automatically discover templates in each app's
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'TaskManagerSystem.wsgi.application'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = False

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / "staticfiles"
# STATICFILES_DIRS = [BASE_DIR / "static"]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'