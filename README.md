#LazyImage ![Travis-ci](https://travis-ci.org/davidcetinkaya/lazy-img.svg?branch=master)

[Check out the demo](https://codepen.io/DavidCetinkaya/full/WoEzvB/)

A minimal but powerful image lazy loader.

Don't make requests for images unless you have to! Lazy image lets you load images as the user scrolls the page. Comes with customizable settings and source loading depending on media query.

- Works on desktops, tablets and mobile phones.
- Only 3.5k minified. ~1.5k with Gzip.
- IE10+ compatible.
- No library dependencies. Written in vanilla JS.
- Load different image sources depending on media query (LG, MD and SM).
- Also works with CSS background images.
- No page jumping on image load - sets placeholders for images not yet loaded.
- Allows for callback function on image load.

##Install

```
npm install lazy-img
```

##Kit
- **[lazy-img.min.js](https://raw.githubusercontent.com/davidcetinkaya/lazy-img/master/dist/lazy-img.min.js)** - production script
- **[lazy-img.required.css](https://raw.githubusercontent.com/davidcetinkaya/lazy-img/master/dist/lazy-img.required.css)** - required styles for proper functioning

##Usage

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
      data-lg-src="img/image1.jpg"
      data-md-src="img/image2.jpg"
      data-sm-src="img/image3.jpg"
      data-lg-width="600"
      data-lg-height="300"
      data-md-width="400"
      data-md-height="200"
      data-sm-width="200"
      data-sm-height="100"
      data-fluid="true"
      alt="">
  </div>
</figure>
```

Setup for a CSS background image:

```html
<div class="c-banner js-lazy-img">
  <div class="c-banner__img js-lazy-img__img"
    data-lg-src="img/image1.jpg"
    data-md-src="img/image2.jpg"
    data-sm-src="img/image3.jpg"
    data-bg-img="true">
  </div>
</div>
```

JavaScript:

```javascript
const lazyImg = LazyImg();
lazyImg.init();
```

##HTML settings

`data-fluid` - boolean. Set to true for responsive image and false for fixed image size. `Optional`

`data-lg-src` – image source for LG screens. Will be used as backup if no other sources are provided. `Required`

`data-md-src` – image source for MD screens. Will be used as backup for SM screens if SM source isn't provided. `Optional`

`data-sm-src` – image source for SM screens. `Optional`

`data-lg-height` – image max height in pixels for LG screens (used to generate placeholder for image). `Optional`

`data-lg-width` – image max width in pixels for LG screens (used to generate placeholder for image). `Optional`

`data-md-height` – image max height in pixels for MD screens (used to generate placeholder for image). `Optional`

`data-md-width` – image max width in pixels for MD screens (used to generate placeholder for image). `Optional`

`data-sm-height` – image max height in pixels for SM screens (used to generate placeholder for image). `Optional`

`data-sm-width` – image max width in pixels for SM screens (used to generate placeholder for image). `Optional`

`data-bg-img` - boolean. Only needed for CSS background images, which has to be set to true. `Optional`

##JavaScript settings

LazyImage accepts an object as an optional second parameter. Default settings are:

```javascript
{
  //Sets placeholders to prevent page jumping on image load.
  //Set to false if you prefer doing this from back-end.
  setPlaceHolders: true,
  
  //Decides how intensely LazyImage should look for images in viewport.
  //Higher numbers will intensify number of checks per second while lower numbers will slow it down.
  scrollFrameRate: 3,
  
  //Decides when an image should be loaded. LazyOffset is subtracted from image offset top. Pixels.
  //Can be used to load images before they're in view. A higher number will load the image earlier.
  lazyOffset: 300,

  //Debounce amount for screen resize events to prevent too many events firing. Milliseconds. 
  resizeDebounce: 300,
  
  //Class name for JavaScript to pick up LazyImage elements.
  //Note that all added classes use the BEM naming convention.
  //Change the stylesheet according to this!
  classPrefix: 'lazy-img',
  
  //Callback function, runs on image load.
  //Recieves the image itself as "this".
  onImgLoad: undefined
}
```

##API

```javascript
//Initialize LazyImage.
init();

//Reinitialize LazyImage.
//Useful when new images has been added to page dynamically.
reInit();
```

##Examples

JavaScript:

```javascript
const lazyImage = LazyImg({
  lazyOffset: 400,
  onImgLoad: function() {
    this.style.opacity = 1;
  }
});
lazyImage.init();
```

JavaScript + jQuery:

```javascript     
const lazyImage = LazyImg({
  lazyOffset: 400,
  onImgLoad: function() {
    $(this).css('opacity', 1);
  }
});
lazyImage.init();
```

##License

[MIT license](http://opensource.org/licenses/MIT)




