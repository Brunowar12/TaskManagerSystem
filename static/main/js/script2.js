// Функция для сворачивания и разворачивания боковой панели
document
  .getElementById('toggle-sidebar')
  .addEventListener('click', function () {
    document.querySelector('.sidebar').classList.toggle('collapsed')
  })
