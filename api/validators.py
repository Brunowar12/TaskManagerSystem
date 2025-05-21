from django.core.validators import RegexValidator

TEXT_FIELD_VALIDATOR = RegexValidator(
    r"^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ0-9_. , -]+$",
    "Text can contain letters (latin/cyrillic), numbers, underscores, dots, dashes, commas and spaces",
)

USERNAME_VALIDATOR = RegexValidator(
    r"^[a-zA-Z0-9_.-]+$",
    "The username can contain only letters, numbers, underscores, periods and hyphens",
)

PHONE_NUMBER_VALIDATOR = RegexValidator(
    r"^\+\d{7,15}$",
    "The phone number must start with '+' and contain 7 to 15 digits only after it",
)
