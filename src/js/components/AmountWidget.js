import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;
    thisWidget.getElements();
    thisWidget.initActions();
  }

  getElements() {
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      settings.amountWidget.defaultMax + 1 >= value &&
      settings.amountWidget.defaultMin - 1 <= value
    );
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;
    thisWidget.setValue(settings.amountWidget.defaultValue);
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
}

export default AmountWidget;
