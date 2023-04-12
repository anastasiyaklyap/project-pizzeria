import { select } from '../settings.js';

class HomePage {
  constructor() {
    this.getElements();

    this.initWidgets();
  }

  getElements() {
    this.dom = {};
    this.dom.carousel = document.querySelector(select.Gallery.carousel);
  }

  initWidgets() {
    // eslint-disable-next-line no-undef
    this.carousel = new Flickity(this.dom.carousel, {
      autoPlay: 3000,
    });
  }
}

export default HomePage;
