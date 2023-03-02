import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }
  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget =
      thisCartProduct.dom.wrapper.querySelector(
        select.CartProduct.amountWidget
      );
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.CartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.CartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.CartProduct.remove
    );
    thisCartProduct.dom.amountWidgetValue =
      thisCartProduct.dom.wrapper.querySelector(select.CartProduct.input).value;
  }

  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );
    thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
    thisCartProduct.dom.amountWidget.addEventListener('updated', () => {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price =
        thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', (e) => {
      e.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', (e) => {
      e.preventDefault();
      thisCartProduct.remove();
    });
  }

  getData() {
    const thisCartProduct = this;
    thisCartProduct.productSummary = {};
    thisCartProduct.productSummary.id = thisCartProduct.id;
    thisCartProduct.productSummary.amount = thisCartProduct.amount;
    thisCartProduct.productSummary.price = thisCartProduct.price;
    thisCartProduct.productSummary.priceSingle = thisCartProduct.priceSingle;
    thisCartProduct.productSummary.name = thisCartProduct.name;
    thisCartProduct.productSummary.params = thisCartProduct.params;
    return thisCartProduct.productSummary;
  }
}

export default CartProduct;
