!(function () {
  // Fetch tasks from the server
  async function fetchTasks() {
    // Проверяем и обновляем токен перед запросом
    const accessToken = await ensureTokenIsValid()

    if (!accessToken) {
      console.error('[ERROR] Не удалось получить валидный токен')
      return []
    }

    try {
      const response = await fetch('/tasks/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`, // Добавляем токен в заголовок
          'Content-Type': 'application/json', // Указываем формат запроса
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tasks: ' + response.status)
      }

      const data = await response.json()
      // Преобразуем задачи в формат, подходящий для календаря
      return data.results
        .filter((task) => !task.completed)
        .map((task) => ({
          eventName: task.title,
          date: moment(task.due_date), // Преобразуем дату в объект moment
          calendar: task.category || 'Other', // Используем категорию или 'Other'
          color:
            task.priority === 'H'
              ? 'red'
              : task.priority === 'M'
              ? 'orange'
              : 'green', // Цвет по приоритету
        }))
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  }

  // Добавляем функцию для проверки и обновления токена
  async function ensureTokenIsValid() {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')

    if (!accessToken || !refreshToken) {
      console.error('[ERROR] Токены отсутствуют в localStorage!')
      return null
    }

    // Раскодируем payload токена и проверяем срок его действия
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    if (tokenPayload.exp > currentTime) {
      return accessToken // Токен ещё действителен
    }

    console.log('[INFO] Токен истёк. Попытка обновления...')

    try {
      const response = await fetch('/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.access)
        console.log('[SUCCESS] Токен успешно обновлён!')
        return data.access
      } else {
        console.error('[ERROR] Не удалось обновить токен!')
        return null
      }
    } catch (error) {
      console.error('[ERROR] Ошибка при обновлении токена:', error)
      return null
    }
  }

  // Initialize calendar with fetched tasks
  async function initializeCalendar() {
    const data = await fetchTasks() // Получаем данные задач
    new Calendar('#calendar', data) // Инициализируем календарь
  }

  // Запускаем инициализацию
  initializeCalendar()

  // Код для календаря без изменений
  var today = moment()

  function Calendar(selector, events) {
    this.el = document.querySelector(selector)
    this.events = events
    this.current = moment().date(1)
    this.draw()
    var current = document.querySelector('.today')
    if (current) {
      var self = this
      window.setTimeout(function () {
        self.openDay(current)
      }, 500)
    }
  }

  Calendar.prototype.draw = function () {
    //Create Header
    this.drawHeader()

    //Draw Month
    this.drawMonth()

    // this.drawLegend();
  }

  Calendar.prototype.drawHeader = function () {
    var self = this
    if (!this.header) {
      //Create the header elements
      this.header = createElement('div', 'header')
      this.header.className = 'header'

      this.title = createElement('h1')

      var right = createElement('div', 'right')
      right.addEventListener('click', function () {
        self.nextMonth()
      })

      var left = createElement('div', 'left')
      left.addEventListener('click', function () {
        self.prevMonth()
      })

      //Append the Elements
      this.header.appendChild(this.title)
      this.header.appendChild(right)
      this.header.appendChild(left)
      this.el.appendChild(this.header)
    }

    this.title.innerHTML = this.current.format('MMMM YYYY')
  }

  Calendar.prototype.drawMonth = function () {
    var self = this

    this.events.forEach(function (ev) {
      ev.date = moment(ev.date) // Преобразуем дату для совместимости
    })

    if (this.month) {
      this.oldMonth = this.month
      this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev')
      this.oldMonth.addEventListener('webkitAnimationEnd', function () {
        self.oldMonth.parentNode.removeChild(self.oldMonth)
        self.month = createElement('div', 'month')
        self.backFill()
        self.currentMonth()
        self.fowardFill()
        self.el.appendChild(self.month)
        window.setTimeout(function () {
          self.month.className = 'month in ' + (self.next ? 'next' : 'prev')
        }, 16)
      })
    } else {
      this.month = createElement('div', 'month')
      this.el.appendChild(this.month)
      this.backFill()
      this.currentMonth()
      this.fowardFill()
      this.month.className = 'month new'
    }
  }

  Calendar.prototype.backFill = function () {
    var clone = this.current.clone()
    var dayOfWeek = clone.day()

    if (!dayOfWeek) {
      return
    }

    clone.subtract('days', dayOfWeek + 1)

    for (var i = dayOfWeek; i > 0; i--) {
      this.drawDay(clone.add('days', 1))
    }
  }

  Calendar.prototype.fowardFill = function () {
    var clone = this.current.clone().add('months', 1).subtract('days', 1)
    var dayOfWeek = clone.day()

    if (dayOfWeek === 6) {
      return
    }

    for (var i = dayOfWeek; i < 6; i++) {
      this.drawDay(clone.add('days', 1))
    }
  }

  Calendar.prototype.currentMonth = function () {
    var clone = this.current.clone()

    while (clone.month() === this.current.month()) {
      this.drawDay(clone)
      clone.add('days', 1)
    }
  }

  Calendar.prototype.getWeek = function (day) {
    if (!this.week || day.day() === 0) {
      this.week = createElement('div', 'week')
      this.month.appendChild(this.week)
    }
  }

  Calendar.prototype.drawDay = function (day) {
    var self = this
    this.getWeek(day)

    //Outer Day
    var outer = createElement('div', this.getDayClass(day))
    outer.addEventListener('click', function () {
      self.openDay(this)
    })

    //Day Name
    var name = createElement('div', 'day-name', day.format('ddd'))

    //Day Number
    var number = createElement('div', 'day-number', day.format('DD'))

    //Events
    var events = createElement('div', 'day-events')
    this.drawEvents(day, events)

    outer.appendChild(name)
    outer.appendChild(number)
    outer.appendChild(events)
    this.week.appendChild(outer)
  }

  Calendar.prototype.drawEvents = function (day, element) {
    if (day.month() === this.current.month()) {
      var todaysEvents = this.events.reduce(function (memo, ev) {
        if (ev.date.isSame(day, 'day')) {
          memo.push(ev)
        }
        return memo
      }, [])

      todaysEvents.forEach(function (ev) {
        var evSpan = createElement('span', ev.color)
        element.appendChild(evSpan)
      })
    }
  }

  Calendar.prototype.getDayClass = function (day) {
    var classes = ['day']
    if (day.month() !== this.current.month()) {
      classes.push('other')
    } else if (today.isSame(day, 'day')) {
      classes.push('today')
    }
    return classes.join(' ')
  }

  Calendar.prototype.openDay = function (el) {
    var details, arrow
    var dayNumber =
      +el.querySelector('.day-number').innerText ||
      +el.querySelector('.day-number').textContent
    var day = this.current.clone().date(dayNumber)

    var currentOpened = document.querySelector('.details')

    if (currentOpened && currentOpened.parentNode === el.parentNode) {
      details = currentOpened
      currentOpened.classList.add('out')
      currentOpened.addEventListener('animationend', function () {
        currentOpened.parentNode.removeChild(currentOpened)
      })
      arrow = document.querySelector('.arrow')
    } else {
      if (currentOpened) {
        currentOpened.addEventListener('animationend', function () {
          currentOpened.parentNode.removeChild(currentOpened)
        })
        currentOpened.className = 'details out'
      }

      details = createElement('div', 'details in')
      arrow = createElement('div', 'arrow')
      details.appendChild(arrow)
      el.parentNode.appendChild(details)

      // Додаємо затримку перед появою тексту
      setTimeout(() => {
        this.renderEvents(
          this.events.filter((ev) => ev.date.isSame(day, 'day')),
          details
        )
      }, 300)
    }
    arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px'
  }

  Calendar.prototype.renderEvents = function (events, ele) {
    var currentWrapper = ele.querySelector('.events')
    var wrapper = createElement(
      'div',
      'events fade-in' + (currentWrapper ? ' new' : '')
    )

    events.forEach(function (ev) {
      var div = createElement('div', 'event')
      var square = createElement('div', 'event-category ' + ev.color)
      var span = createElement('span', '', ev.eventName)

      div.appendChild(square)
      div.appendChild(span)
      wrapper.appendChild(div)
    })

    if (!events.length) {
      var div = createElement('div', 'event empty')
      var span = createElement('span', '', 'No Events')
      div.appendChild(span)
      wrapper.appendChild(div)
    }

    if (currentWrapper) {
      currentWrapper.classList.add('fade-out')
      currentWrapper.addEventListener('animationend', function () {
        currentWrapper.parentNode.removeChild(currentWrapper)
        ele.appendChild(wrapper)
      })
    } else {
      ele.appendChild(wrapper)
    }
  }

  Calendar.prototype.nextMonth = function () {
    this.current.add('months', 1)
    this.next = true
    this.draw()
  }

  Calendar.prototype.prevMonth = function () {
    this.current.subtract('months', 1)
    this.next = false
    this.draw()
  }

  window.Calendar = Calendar

  function createElement(tagName, className, innerText) {
    var ele = document.createElement(tagName)
    if (className) {
      ele.className = className
    }
    if (innerText) {
      ele.innerText = ele.textContent = innerText
    }
    return ele
  }
})()
