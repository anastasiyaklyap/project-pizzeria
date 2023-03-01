import utils from '../utils.js';
import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
  }
  render(element) {
    this.dom = {};
    this.dom.wrapper = element;
    const generatedHTML = templates.bookingWidget();
    this.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));
    this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }
  initWidgets() {
    this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
  }
}

export default Booking;
