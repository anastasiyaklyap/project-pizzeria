import utils from '../utils.js';
import { templates, select, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
    this.getData();
    this.bookedTable = null;
  }
  getData() {
    const params = new Map();
    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(
      this.datePickerWidget.minDate
    )}`;
    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(
      this.datePickerWidget.maxDate
    )}`;
    params.set('booking', [startDateParam, endDateParam]);
    params.set('eventsCurrent', [
      settings.db.notRepeatParam,
      startDateParam,
      endDateParam,
    ]);
    params.set('eventsRepeat', [settings.db.repeatParam, endDateParam]);
    const urls = new Map();

    urls.set(
      'booking',
      `${settings.db.url}/${settings.db.booking}?${params
        .get('booking')
        .join('&')}`
    );
    urls.set(
      'eventsCurrent',
      `${settings.db.url}/${settings.db.event}?${params
        .get('eventsCurrent')
        .join('&')}`
    );
    urls.set(
      'eventsRepeat',
      `${settings.db.url}/${settings.db.event}?${params
        .get('eventsRepeat')
        .join('&')}`
    );

    const fetchData = async () => {
      const responses = await Promise.all([
        fetch(urls.get('booking')),
        fetch(urls.get('eventsCurrent')),
        fetch(urls.get('eventsRepeat')),
      ]);
      const [bookingsResponse, eventsCurrentResponse, eventsRepeatResponse] =
        responses;
      const bookings = await bookingsResponse.json();
      const eventsCurrent = await eventsCurrentResponse.json();
      const eventsRepeat = await eventsRepeatResponse.json();
      this.parseData(bookings, eventsCurrent, eventsRepeat);
    };
    fetchData();
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    this.booked = new Map();
    for (let item of bookings) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = this.datePickerWidget.minDate;
    const maxDate = this.datePickerWidget.maxDate;
    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          this.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    this.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    if (typeof this.booked.get(date) == 'undefined') {
      this.booked.set(date, new Map());
    }
    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof this.booked.get(date).get(hourBlock) == 'undefined') {
        this.booked.get(date).set(hourBlock, []);
      }
      this.booked.get(date).get(hourBlock).push(table);
    }
  }

  updateDOM() {
    this.date = this.datePickerWidget.value;
    this.hour = utils.hourToNumber(this.hourPickerWidget.value);

    let allAvailable = false;

    if (
      typeof this.booked.get(this.date) == 'undefined' ||
      typeof this.booked.get(this.date).get(this.hour) == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of this.dom.get('tables')) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable &&
        this.booked.get(this.date).get(this.hour).includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    this.dom = new Map();
    this.dom.set('wrapper', element);
    const generatedHTML = templates.bookingWidget();
    this.dom.get('wrapper').appendChild(utils.createDOMFromHTML(generatedHTML));
    this.dom.set(
      'peopleAmount',
      document.querySelector(select.booking.peopleAmount)
    );
    this.dom.set(
      'hoursAmount',
      document.querySelector(select.booking.hoursAmount)
    );
    this.dom.set(
      'datePicker',
      document.querySelector(select.widgets.datePicker.wrapper)
    );
    this.dom.set(
      'hourPicker',
      document.querySelector(select.widgets.hourPicker.wrapper)
    );
    this.dom.set('tables', document.querySelectorAll(select.booking.tables));
    this.dom.set('allTables', document.querySelector(select.booking.allTables));
    this.dom.set('form', document.querySelector(select.booking.form));
    this.dom.set('phone', document.querySelector(select.booking.phone));
    this.dom.set('address', document.querySelector(select.booking.address));
    this.dom.set(
      'starters',
      document.querySelectorAll(select.booking.starters)
    );
  }

  initTables(element) {
    const tableId = element.target.getAttribute(
      settings.booking.tableIdAttribute
    );
    if (tableId) {
      if (element.target.classList.contains(classNames.booking.tableBooked)) {
        alert(`Table no ${tableId} is already booked`);
      } else {
        for (let table of this.dom.get('tables')) {
          if (table.classList.contains(classNames.booking.tableSelected)) {
            table.classList.remove(classNames.booking.tableSelected);
          } else {
            table.classList.toggle(
              classNames.booking.tableSelected,
              table.getAttribute(settings.booking.tableIdAttribute) == tableId
            );
          }
        }

        this.bookedTable = tableId;
      }
    }
  }

  initWidgets() {
    this.peopleAmountWidget = new AmountWidget(this.dom.get('peopleAmount'));
    this.hoursAmountWidget = new AmountWidget(this.dom.get('hoursAmount'));
    this.datePickerWidget = new DatePicker(this.dom.get('datePicker'));
    this.hourPickerWidget = new HourPicker(this.dom.get('hourPicker'));
    this.dom.get('wrapper').addEventListener('updated', () => {
      this.updateDOM();
      for (let table of this.dom.get('tables')) {
        table.classList.remove(classNames.booking.tableSelected);
      }

      this.bookedTable = null;
    });
    this.dom.get('allTables').addEventListener('click', (e) => {
      this.initTables(e);
    });
    this.dom.get('form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendBooking();
    });
  }

  sendBooking() {
    const url = `${settings.db.url}/${settings.db.booking}`;
    const payload = {};
    payload.date = this.date;
    payload.hour = this.hourPickerWidget.value;
    payload.table = +this.bookedTable;
    payload.duration = this.hoursAmountWidget.value;
    payload.ppl = this.peopleAmountWidget.value;
    payload.phone = this.dom.get('phone').value;
    payload.address = this.dom.get('address').value;
    payload.starters = [];
    for (let starter of this.dom.get('starters')) {
      starter.checked && payload.starters.push(starter.value);
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    const fetchData = async (url, options) => {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          this.makeBooked(
            payload.date,
            payload.hour,
            payload.duration,
            payload.table
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData(url, options);
  }
}

export default Booking;
