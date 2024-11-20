!(function () {
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
    this.drawHeader()
    this.drawMonth()
  }

  Calendar.prototype.drawHeader = function () {
    var self = this
    if (!this.header) {
      this.header = createElement('div', 'header')
      this.title = createElement('h1')
      var right = createElement('div', 'right')
      right.addEventListener('click', function () {
        self.nextMonth()
      })

      var left = createElement('div', 'left')
      left.addEventListener('click', function () {
        self.prevMonth()
      })

      this.header.appendChild(this.title)
      this.header.appendChild(right)
      this.header.appendChild(left)
      this.el.appendChild(this.header)
    }

    this.title.innerHTML = this.current.format('MMMM YYYY')
  }

  Calendar.prototype.drawMonth = function () {
    var self = this

    if (this.month) {
      this.oldMonth = this.month
      this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev')
      this.oldMonth.addEventListener('webkitAnimationEnd', function () {
        self.oldMonth.parentNode.removeChild(self.oldMonth)
        self.month = createElement('div', 'month')
        self.backFill()
        self.currentMonth()
        self.fowardFill()
        self.el.appendChild(this.month)
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

    var outer = createElement('div', this.getDayClass(day))
    outer.addEventListener('click', function () {
      self.openDay(this)
    })

    var name = createElement('div', 'day-name', day.format('ddd'))
    var number = createElement('div', 'day-number', day.format('DD'))
    var events = createElement('div', 'day-events')
    this.drawEvents(day, events)

    outer.appendChild(name)
    outer.appendChild(number)
    outer.appendChild(events)
    this.week.appendChild(outer)
  }

  Calendar.prototype.drawEvents = function (day, element) {
    if (day.month() === this.current.month()) {
      const todaysEvents = this.events.filter((ev) =>
        ev.date.isSame(day, 'day')
      )

      todaysEvents.forEach(function (ev) {
        const evSpan = createElement('span', `event-color ${ev.color}`)
        element.appendChild(evSpan)
      })
    }
  }

  Calendar.prototype.getDayClass = function (day) {
    classes = ['day']
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
      +el.querySelectorAll('.day-number')[0].innerText ||
      +el.querySelectorAll('.day-number')[0].textContent
    var day = this.current.clone().date(dayNumber)

    var currentOpened = document.querySelector('.details')

    if (currentOpened && currentOpened.parentNode === el.parentNode) {
      details = currentOpened
      currentOpened.className = 'details out'
      currentOpened.addEventListener('animationend', function () {
        currentOpened.parentNode.removeChild(currentOpened)
      })
    } else {
      if (currentOpened) {
        currentOpened.className = 'details out'
        currentOpened.addEventListener('animationend', function () {
          currentOpened.parentNode.removeChild(currentOpened)
        })
      }

      details = createElement('div', 'details in')
      const arrow = createElement('div', 'arrow')
      details.appendChild(arrow)
      el.parentNode.appendChild(details)
    }

    const todaysEvents = this.events.filter((ev) => ev.date.isSame(day, 'day'))
    this.renderEvents(todaysEvents, details)
  }

  Calendar.prototype.renderEvents = function (events, ele) {
    const currentWrapper = ele.querySelector('.events')
    const wrapper = createElement(
      'div',
      'events in' + (currentWrapper ? ' new' : '')
    )

    events.forEach(function (ev) {
      const div = createElement('div', 'event')
      const square = createElement('div', 'event-category ' + ev.color)
      const span = createElement('span', '', ev.eventName)

      div.appendChild(square)
      div.appendChild(span)
      wrapper.appendChild(div)
    })

    if (!events.length) {
      const div = createElement('div', 'event empty')
      const span = createElement('span', '', 'No Events')
      div.appendChild(span)
      wrapper.appendChild(div)
    }

    if (currentWrapper) {
      currentWrapper.className = 'events out'
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
    const ele = document.createElement(tagName)
    if (className) {
      ele.className = className
    }
    if (innerText) {
      ele.innerText = ele.textContent = innerText
    }
    return ele
  }
})()
;(async function () {
  async function fetchTasksForCalendar() {
    const accessToken = localStorage.getItem('access_token')
    try {
      const response = await fetch('/tasks/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()

        return data.results.map((task) => ({
          eventName: task.title,
          date: moment(task.due_date, 'YYYY-MM-DD'),
          calendar: 'Tasks',
          color: getRandomColor(), // Добавляем случайный цвет
        }))
      } else {
        console.error('Ошибка загрузки задач:', response.statusText)
        return []
      }
    } catch (error) {
      console.error('Ошибка загрузки задач:', error)
      return []
    }
  }

  function getRandomColor() {
    const colors = ['orange', 'blue', 'green', 'purple', 'red', 'yellow']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const taskEvents = await fetchTasksForCalendar()

  const calendar = new Calendar('#calendar', taskEvents)
})()
