import { settings, select } from './../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.dom = {};

    thisWidget.dom.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);
    if (
      thisWidget.value != newValue &&
      !isNaN(newValue) &&
      settings.amountWidget.defaultMax + 1 >= newValue &&
      settings.amountWidget.defaultMin - 1 <= newValue
    ) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', () => {
      thisWidget.setValue(parseInt(thisWidget.dom.input.value));
    });
    thisWidget.dom.linkDecrease.addEventListener('click', (e) => {
      e.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', (e) => {
      e.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) + 1);
    });
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
