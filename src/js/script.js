/* global utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmounntWidget();
      thisProduct.processOrder();
    }
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;

      thisProduct.dom = {};
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.dom.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.dom.formInputs = thisProduct.element.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.dom.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.dom.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }
    initAccordion() {
      const thisProduct = this;
      thisProduct.dom.accordionTrigger.addEventListener(
        'click',
        function (event) {
          event.preventDefault();
          const activeProduct = document.querySelector('.product.active');
          if (activeProduct && activeProduct !== thisProduct.element) {
            activeProduct.classList.remove(
              classNames.menuProduct.wrapperActive
            );
          }
          thisProduct.element.classList.toggle(
            classNames.menuProduct.wrapperActive
          );
        }
      );
    }
    initOrderForm() {
      const thisProduct = this;
      thisProduct.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      let price = thisProduct.data.price;
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for (let optionId in param.options) {
          const option = param.options[optionId];
          const imgClass = `${paramId}-${optionId}`;
          const image = thisProduct.dom.imageWrapper.querySelector(
            `.${imgClass}`
          );
          if (image) {
            image.classList.remove(classNames.menuProduct.imageVisible);
            if (formData[paramId] && formData[paramId].includes(optionId)) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }
          }
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            if (!option.default) {
              price += option.price;
            }
          } else {
            if (option.default) {
              price -= option.price;
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmounntWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(
        thisProduct.dom.amountWidgetElem
      );
      thisProduct.dom.amountWidgetElem.addEventListener('updated', () => {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;
      thisProduct.productSummary = {};
      thisProduct.productSummary.id = thisProduct.id;
      thisProduct.productSummary.name = thisProduct.data.name;
      thisProduct.productSummary.amount = thisProduct.amountWidget.value;
      thisProduct.productSummary.priceSingle = thisProduct.priceSingle;
      thisProduct.productSummary.price =
        thisProduct.priceSingle * thisProduct.productSummary.amount;
      thisProduct.productSummary.params =
        thisProduct.prepareCartProductParams();
      return thisProduct.productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {},
        };
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
    }
    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );
      thisCart.dom.productList = element.querySelector(select.cart.productList);
    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', () => {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generateDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generateDOM);
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function () {
      const thisApp = this;
      console.log('settings:', settings);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
