// Функція для відображення імені авторизованого користувача
function displayUserNameInHeader() {
  const username = localStorage.getItem('username') // Отримуємо ім'я користувача з localStorage

  if (username) {
    // Якщо користувач авторизований, оновлюємо ім'я в заголовку
    const usernameLink = document.querySelector('.header-right a')
    usernameLink.textContent = username // Замінюємо "Dmytro Gordon" на ім'я користувача
  } else {
    // Якщо користувач не авторизований, перенаправляємо його на сторінку входу
    window.location.href = '/auth'
  }
}

// Виконуємо перевірку при завантаженні сторінки
window.addEventListener('load', displayUserNameInHeader)
