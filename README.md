# LazyImage ![Travis-ci](https://travis-ci.org/davidcetinkaya/lazy-img.svg?branch=master) [![npm version](https://badge.fury.io/js/lazy-img.svg)](https://badge.fury.io/js/lazy-img)

[Check out the demo](https://codepen.io/DavidCetinkaya/full/WoEzvB/)

A minimal, fast and powerful image lazy loader.

Don't make requests for images unless you have to! Lazy image lets you load images as the user scrolls the page. Comes with customizable settings and source loading depending on media query.

- Works on desktops, tablets and mobile phones.
- Only 5.9k minified. ~2.5k with Gzip.
- IE9+ compatible.
- Written in vanilla JS.
- Load different image sources depending on media query.
- Also works with CSS background images.
- Loads images in a sequence for great performance. 
- Allows for callback function on image load.

## Install

```bash
$ npm install lazy-img --save
```

## Kit
- **[lazy-img.js](https://raw.githubusercontent.com/davidcetinkaya/lazy-img/master/dist/lazy-img.js)** - production script
- **[lazy-img.required.css](https://raw.githubusercontent.com/davidcetinkaya/lazy-img/master/dist/lazy-img.required.css)** - required styles for proper functioning

## Usage

HTML markup:

Place this tag anywhere on your page for LazyImage to pick upp media queries.

```html
<div class="c-js-breakpoint-hook" id="js-breakpoint-hook">
</div>
```

Setup for a regular image tag:

```html
<figure class="c-lazy-img js-lazy-img">
  <div class="c-lazy-img__inner js-lazy-img__inner">
    <img class="c-lazy-img__img js-lazy-img__img"
      src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
      data-lg-src="img/image.jpg"
      data-lg-width="600"
      data-lg-height="300"
      data-fluid="true"
      alt="">
  </div>
</figure>
```

Setup for a CSS background image:

```html
<div class="js-lazy-img">
  <div class="js-lazy-img__img"
    data-lg-src="img/image.jpg"
    data-bg-img="true">
  </div>
</div>
```

JavaScript:

```javascript
const lazyImage = LazyImg();
lazyImage.init();
```

## HTML settings

Sources for media queries are applied like so: `data-*query*-src`. Note that `data-lg-src` is required while other sources are optional. Placeholder sizes for media queries follow the same principle: `data-*query*-width` and `data-*query*-height`.

Avaliable media queries are:
- `xxs` min-width: **0px**
- `xs` min-width: **480px**
- `sm` min-width: **768px**
- `md` min-width: **992px**
- `lg` min-width: **1200px**  

#### `data-lg-src`
String. Image source for `lg` screens. `Required`

#### `data-lg-width`
Floating point number. Image max width in pixels for `lg` screens.

#### `data-lg-height`
Floating point number. Should be set in relation to `data-lg-width` for LazyImage to set image size with correct aspect ratio.

#### `data-bg-img`
Boolean. Only needed for CSS background images, which has to be set to true.

#### `data-fluid`
Boolean. Set to true for responsive image and false for fixed image size.


## JavaScript settings

LazyImage accepts an object as an optional parameter. Default settings are:

```javascript
{
  //Sets placeholders to prevent page jumping on image load. Boolean.
  setPlaceHolders: true,

  //Decides how much checks for images in viewport should be throttled. Milliseconds.
  checkInterval: 500,

  //LazyOffset is subtracted from image offset top minus window height. Pixels.
  lazyOffset: 0,

  //Class name for JavaScript to pick up LazyImage elements. 
  classPrefix: 'js-lazy-img',

  //Callback that runs on image load. Recieves two parameters: 
  //The loaded image element and a bool indicating if the image loaded successfully. Function.
  onImgLoad: undefined
}
```

Don't forget to change your stylesheet accordingly if you change the `classPrefix` property. LazyImage uses [BEM](https://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/) naming convention and will look for elements with following class names:
- `Wrap`: **classPrefix**
- `Inner`: **classPrefix**__inner
- `Img`: **classPrefix**__img

## API

```javascript
//Initialize LazyImage.
lazyImg.init();

//Reinitialize LazyImage. Useful when new images has been added to page dynamically.
lazyImg.reInit();

//Update LazyImage. Use with window resize and orientationchange events.
lazyImg.update();
```

## Examples

JavaScript:

```javascript
//Initialize with custom options
const lazyImage = LazyImg({
  lazyOffset: 100,
  onImgLoad: (image, successfullyLoaded) => {
    image.style.opacity = 1;
    console.log(successfullyLoaded);
  }
});
lazyImage.init();

//Simplified example of window resize implementation
import _debounce from 'lodash.debounce';
window.addEventListener('resize', _debounce(lazyImage.update, 700), false);
window.addEventListener('orientationchange', _debounce(lazyImage.update, 700), false);
```

JavaScript + jQuery:

```javascript
//Initialize with custom options
const lazyImage = LazyImg({
  lazyOffset: 100,
  onImgLoad: (image, successfullyLoaded) => {
    $(image).css('opacity', 1);
    console.log(successfullyLoaded);
  }
});
lazyImage.init();

//Simplified example of window resize implementation
import _debounce from 'lodash.debounce';
$(window).on('resize', _debounce(lazyImage.update, 700));
$(window).on('orientationchange', _debounce(lazyImage.update, 700));
```

## License

[MIT license](http://opensource.org/licenses/MIT)
