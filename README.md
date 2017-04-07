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
<div class="c-banner js-lazy-img">
  <div class="c-banner__img js-lazy-img__img"
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

Avaliable media queries are `xxs`, `xs`, `sm`, `md`, `lg`. Sources for media queries are applied like so: `data-<strong>query</strong>-src`. Note that `data-lg-src` is required while other sources are optional. Sizes for media queries follow the same principle: `data-__query__-width` and `data-__query__-height`.

See [examples](#examples) section for implementation.

#### `data-bg-img`
Boolean. Only needed for CSS background images, which has to be set to true.

#### `data-fluid`
Boolean. Set to true for responsive image and false for fixed image size.

#### `data-lg-src`
String. Image source for LG screens. `Required`

#### `data-lg-width`
Floating point number. Image max width in pixels for LG screens.

#### `data-lg-height`
Floating point number. Should be set in relation to `data-lg-width` for LazyImage to set image size with correct aspect ratio.


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

  //Class name for JavaScript to pick up LazyImage elements. Change the stylesheet according to this!
  classPrefix: 'lazy-img',

  //Callback function, runs on image load. Recieves two parameters. First is the loaded image element and the
  //second is if the image loaded successfully or not. Function.
  onImgLoad: undefined
}
```

## API

```javascript
//Initialize LazyImage.
lazyImg.init();

//Reinitialize LazyImage. Useful when new images has been added to page dynamically.
lazyImg.reInit();

//Update LazyImage. Use with window resize and orientationchange events.
lazyImg.update();
```

## <a name="examples"></a>Examples

JavaScript:

```javascript
const lazyImage = LazyImg({
  lazyOffset: 100,
  onImgLoad: (image) => {
    image.style.opacity = 1;
  }
});

lazyImage.init();
```

JavaScript + jQuery:

```javascript     
const lazyImage = LazyImg({
  lazyOffset: 100,
  onImgLoad: (image) => $(image).css('opacity', 1)
});

lazyImage.init();
```

## License

[MIT license](http://opensource.org/licenses/MIT)
