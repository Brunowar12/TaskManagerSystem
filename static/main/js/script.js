// Отображение текущей даты
document.getElementById('date').innerText = new Date().toLocaleDateString(
  'en-EN',
  {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
)

// Функция для сворачивания и разворачивания боковой панели
document
  .getElementById('toggle-sidebar')
  .addEventListener('click', function () {
    document.querySelector('.sidebar').classList.toggle('collapsed')
  })
