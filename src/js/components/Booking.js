import utils from '../utils.js';
import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
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
  }
  initWidgets() {
    this.peopleAmountWidget = new AmountWidget(this.dom.get('peopleAmount'));
    this.hoursAmountWidget = new AmountWidget(this.dom.get('hoursAmount'));
    this.datePickerWidget = new DatePicker(this.dom.get('datePicker'));
    this.hourPickerWidget = new HourPicker(this.dom.get('hourPicker'));
  }
}

export default Booking;
