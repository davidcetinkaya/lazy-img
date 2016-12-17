/* exported LazyImg */
function LazyImg(options) {
  'use strict';

  // Global declarations
  const globals = {
      images: undefined,
      imgCount: 0,
      loadCount: 0,
      isScrollLooping: true,
      mediaQueryGetter: GetCurrentMediaQuery(),
      lastMediaQuery: {
        LG: false,
        MD: false,
        SM: false
      }
    };


  // Default options
  const o = {
    setPlaceHolders: true,
    scrollFrameRate: 3,
    lazyOffset: 300,
    resizeDebounce: 300,
    classPrefix: 'lazy-img',
    onImgLoad: undefined
  };


  // Merge user options into defaults
  options && mergeObjects(o, options);


  // Classes
  const classes = {
    wrap: `js-${o.classPrefix}`,
    inner: `js-${o.classPrefix}__inner`,
    img: `js-${o.classPrefix}__img`
  };


  // Merge two objects into one
  function mergeObjects(target, source) {
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }


  function setObjectPropertyStates(obj, state) {
    for (let prop in obj) {
      obj[prop] = (state === prop.toString()) ? true : false;
    }
  }


  // Returns the current media query as a string.
  // Used to both load img src and set placeholders depending on media query.
  function getCurrentMediaQuery() {
    const mq = globals.mediaQueryGetter.queries;
    return mq.screenLG ? 'LG' : mq.screenMD ? 'MD' : 'SM';
  }


  function getElement(el, selector, all) {
    return el[`querySelector${(all ? 'All' : '')}`](selector);
  }


  function addEvent(el, event, func, bool) {
    el.addEventListener(event, func, !!bool);

    // Enable removing the event listener from anonymous function
    return {
      remove: () => removeEvent(el, event, func, bool)
    };
  }


  function removeEvent(el, event, func, bool) {
    el.removeEventListener(event, func, !!bool);
  }


  function isDataAttr(attr) {
    return attr && attr.match(/^(data-.)/);
  }


  function isNumeric(obj) {
    return !isNaN(parseFloat(obj)) && isFinite(obj);
  }


  function makeDataAttributeToCamelCase(attribute) {
    return attribute.replace(/^(data-)/, '').replace(/(-\w)/g, (match) => {
      return match.replace('-', '').toUpperCase();
    });
  }


  function makeStringToBool(obj) {
    switch (obj) {
      case 'true':
        return true;
      case 'false':
        return false;
    }
    // Fallback: Return the passed string as it is.
    return obj;
  }


  function getDataAttributes(el) {
    const attributes = el.attributes,
      dataAttributes = {};

    for (let attribute in attributes) {
      if (isDataAttr(attributes[attribute].name)) {
        const key = makeDataAttributeToCamelCase(attributes[attribute].name),
          value = attributes[attribute].value;
        
        dataAttributes[key] = isNumeric(value) ? parseFloat(value) : makeStringToBool(value);
      }
    }
    return dataAttributes;
  }


  function cacheImages() {
    const elements = getElement(document, `.${classes.wrap}`, true),
      images = [];

    for (let i = 0, count = elements.length; i < count; i++) {
      const item = {
        wrap: elements[i],
        inner: getElement(elements[i], `\.${classes.inner}`),
        img: getElement(elements[i], `\.${classes.img}`),
        hasLoadedAny: false,
        hasLoaded: {
          LG: false,
          MD: false,
          SM: false
        }
      };
      mergeObjects(item, getDataAttributes(item.img));
      images.push(item);
    }
    return images;
  }


  function setImageOffsets() {
    globals.images.forEach(item => {
      item.offsetTop = Math.floor(item.img.getBoundingClientRect().top + window.pageYOffset);
    });
  }


  function setImgPlaceholders() {
    let mediaQuery = getCurrentMediaQuery().toLowerCase(),
      height = 0,
      width = 0;

    globals.images.forEach(item => {
      width = item[`${mediaQuery}Width`] || item.mdWidth || item.lgWidth;
      height = item[`${mediaQuery}Height`] || item.mdHeight || item.lgHeight;
      item.wrap.style[(item.fluid ? 'max-width' : 'width')] = `${width}px`;
      // Build image placeholders with the padding-bottom hack.
      // Prevents page from jumping when images get loaded.
      if (o.setPlaceHolders && !item.bgImg) item.inner.style.paddingBottom = `${height / width * 100}%`;
    });
  }


  function setBackgroundImageSrc(item, src) {
    item.style.backgroundImage = `url('${src}')`;
  }


  function setImgSrc(item, size) {
    const src = item[`${size.toLowerCase()}Src`] || item.mdSrc || item.lgSrc,
      img = !item.bgImg ? item.img : document.createElement('img');

      img.setAttribute('src', src);
      item.bgImg && setBackgroundImageSrc(item.img, src);
      o.onImgLoad && !item.hasLoadedAny && onImageLoad(item, img);
  }


  function onImageLoad(item, img) {
    const listener = addEvent(img, 'load', () => {
      o.onImgLoad.call(item.img);
      listener.remove();
    });

    item.hasLoadedAny = true;
    globals.loadCount++;
  }


  function isImageInViewport(scrollOffset, force) {
    const winBottomPosition = scrollOffset + window.innerHeight,
      currentMq = getCurrentMediaQuery();

    function isInScreen(item) {
      return (winBottomPosition + o.lazyOffset) > item.offsetTop;
    }

    globals.images.forEach(item => {
      if (isInScreen(item) || force && !item.hasLoaded[currentMq]) {
        setImgSrc(item, currentMq);
        setObjectPropertyStates(item.hasLoaded, currentMq);
      }
    });
  }


  // Fake a scroll checker with recursive setTimouts.
  function initScrollChecker() {
    (function loop() {
      isImageInViewport(window.pageYOffset);
      // Kill scroll checker when every image has been loaded.
      globals.loadCount === globals.imgCount && killScrollChecker();
      globals.isScrollLooping && setTimeout(loop, 1000 / o.scrollFrameRate);
    }());
  }


  function killScrollChecker() {
    globals.isScrollLooping = false;
  }


  const onWidthChange = Debounce(() => {
      globals.mediaQueryGetter.init();
      const currentMq = getCurrentMediaQuery();

      if (!globals.lastMediaQuery[currentMq]) {
        setObjectPropertyStates(globals.lastMediaQuery, currentMq);
        !globals.isScrollLooping && isImageInViewport(false, true);
        initialize();
      }
  }, o.resizeDebounce);


  function initialize(shouldInitScrollChecker) {
    if (!globals.images) {
      globals.images = cacheImages();
      globals.imgCount = globals.images.length;
      shouldInitScrollChecker && initScrollChecker();
      
      // Listen for resize events
      addEvent(window, 'resize', onWidthChange);
      addEvent(window, 'orientationchange', onWidthChange);
    }

    setImgPlaceholders();
    globals.isScrollLooping && setImageOffsets();
  }


  return {
    init: () => { 
      globals.mediaQueryGetter.init();
      initialize(globals.isScrollLooping);
    },
    reInit: () => {
      const shouldInitScrollChecker = !globals.isScrollLooping ? true : false;
      globals.images = false;
      globals.loadCount = 0;

      if (!globals.isScrollLooping) globals.isScrollLooping = true;
      initialize(shouldInitScrollChecker);
    }
  };
}