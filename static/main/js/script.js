// Отображение текущей даты
const dateElement = document.getElementById('date')
if (dateElement) {
  dateElement.innerText = new Date().toLocaleDateString('en-EN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
} else {
  console.warn("Элемент с ID 'date' не найден на этой странице.")
}

// Функция для сворачивания и разворачивания боковой панели
const toggleSidebar = document.getElementById('toggle-sidebar')
if (toggleSidebar) {
  toggleSidebar.addEventListener('click', function () {
    document.querySelector('.sidebar').classList.toggle('collapsed')
  })
} else {
  console.error('Элемент #toggle-sidebar не найден!')
}
