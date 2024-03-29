import { settings, select, classNames } from './settings.js';
import Cart from './components/Cart.js';
import Product from './components/Product.js';
import Booking from './components/Booking.js';
import HomePage from './components/Home.js';

const app = {
  activatePage: function (pageId) {
    const thisApp = this;
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === `#${pageId}`
      );
    }
  },

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.homeLinks = document.querySelectorAll(select.nav.homeLinks);

    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', (e) => {
        const clickedElement = e.target;

        e.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = `#/${id}`;
      });
    }
    for (let link of thisApp.homeLinks) {
      link.addEventListener('click', (e) => {
        const clickedElement = e.target;

        e.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = `#/${id}`;
      });
    }
  },
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail.product);
    });
  },
  initBooking: function () {
    const thisApp = this;
    const bookingElem = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingElem);
  },

  initHome: function () {
    const thisApp = this;
    const homePageElement = document.querySelector(select.containerOf.home);
    thisApp.homePage = new HomePage(homePageElement);
  },

  init: function () {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
  },
};

app.init();
