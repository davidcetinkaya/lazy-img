// DEPENDENCIES
import _throttle from 'lodash.throttle';
import getCurrentMediaQuery from './getCurrentMediaQuery';

// MAIN
const lazyImg = (options) => {
  // Global declarations
  const GLOBALS = {
    images: undefined,
    scrollListener: undefined,
    lastMediaQuery: undefined,
    loadCount: 0,
    getMediaQuery: getCurrentMediaQuery
  };


  // Default options
  const OPTIONS = {
    setPlaceHolders: true,
    checkInterval: 500,
    lazyOffset: 0,
    classPrefix: 'lazy-img',
    onImgLoad: undefined
  };


  // Merge user options into defaults
  Object.assign(OPTIONS, options);


  // Classes
  const CLASSES = {
    wrap: `js-${OPTIONS.classPrefix}`,
    inner: `js-${OPTIONS.classPrefix}__inner`,
    img: `js-${OPTIONS.classPrefix}__img`
  };


  function getElement(element, selector, selectAll) {
    return element[`querySelector${(selectAll ? 'All' : '')}`](selector);
  }


  function getElementOffsetY(element, offsetY) {
    return (element.getBoundingClientRect().top + offsetY) - OPTIONS.lazyOffset;
  }


  function isItemInView(offsetY) {
    return triggerOffset => offsetY > triggerOffset;
  }


  function addEvent(element, event, func, bool) {
    element.addEventListener(event, func, !!bool);
    return { remove: () => element.removeEventListener(event, func, !!bool) };
  }


  function isNumeric(source) {
    return !isNaN(parseFloat(source)) && isFinite(source);
  }


  function stringToBool(source) {
    return source === 'true' ? true : source === 'false' ? false : source; // eslint-disable-line no-nested-ternary
  }


  function formatAttributeValue(source) {
    return isNumeric(source) ? parseFloat(source) : stringToBool(source);
  }


  function isDataAttribute(attribute) {
    return attribute && attribute.match(/^(data-.)/);
  }


  function dataAttrToCamelCase(dataAttribute) {
    return dataAttribute.replace(/^(data-)/, '').replace(/(-\w)/g, match =>
      match.replace('-', '').toUpperCase());
  }


  function forEachItem(array, callback, startIndex) {
    for (let i = startIndex || 0; i < array.length; i += 1) {
      const returnValue = callback(array[i], i);
      if (returnValue) return returnValue;
    }
    return false;
  }


  function parseDataAttributes(attributes) {
    const returnObject = {};
    forEachItem(attributes, (attribute) => {
      if (isDataAttribute(attribute.name)) {
        returnObject[dataAttrToCamelCase(attribute.name)] = formatAttributeValue(attribute.value);
      }
    });
    return returnObject;
  }


  function setupItems(elements) {
    const returnArray = [];
    forEachItem(elements, (element) => {
      const item = {
        wrap: element,
        inner: getElement(element, `.${CLASSES.inner}`),
        img: getElement(element, `.${CLASSES.img}`)
      };
      returnArray.push(Object.assign(item, parseDataAttributes(item.img.attributes)));
    });
    return returnArray;
  }


  function setTriggerOffsets(items) {
    const offsetY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const setTriggerOffset = item =>
      Object.assign(item, { triggerOffset: getElementOffsetY(item.img, offsetY) - windowHeight });
    return items.map(setTriggerOffset).sort((a, b) => a.triggerOffset - b.triggerOffset);
  }


  function getSuitableSize(item, size, property) {
    const queries = GLOBALS.getMediaQuery.queries;
    return item[size + property] || forEachItem(queries, (query) => {
      const backupSize = item[query + property];
      return backupSize && backupSize;
    }, queries.indexOf(size) + 1);
  }


  function setPlaceholders(items, mediaQuery) {
    function createPlaceHolder(item) {
      const width = getSuitableSize(item, mediaQuery, 'Width');
      const height = getSuitableSize(item, mediaQuery, 'Height');
      const wrap = item.wrap;
      const inner = item.inner;
      if (width && height) wrap.style[(item.fluid ? 'max-width' : 'width')] = `${width}px`;
      if (OPTIONS.setPlaceHolders && inner) inner.style.paddingBottom = `${(height / width) * 100}%`;
    }
    return items.forEach(createPlaceHolder) || items;
  }


  function setLoadAndErrorListeners(item, img, size, callback) {
    const events = ['load', 'error'];
    const listeners = [];
    forEachItem(events, (event) => {
      listeners.push(addEvent(img, event, () => {
        if (!item.hasLoaded) GLOBALS.loadCount += 1;
        if (OPTIONS.onImgLoad) OPTIONS.onImgLoad(item.img, event === 'load');
        if (callback) callback();
        Object.assign(item, { hasLoaded: true });
        listeners.forEach(({ remove }) => remove());
      }));
    });
  }


  function setItemSrc(item, size) {
    const src = getSuitableSize(item, size, 'Src');
    const testImage = document.createElement('img');
    const image = item.img;

    testImage.src = src;
    if (item.bgImg) { image.style.backgroundImage = `url('${src}')`; } else { image.src = src; }
    return callback => setLoadAndErrorListeners(item, testImage, size, callback);
  }


  function storeItemsInView(items) {
    const isInView = isItemInView(window.pageYOffset);
    const returnArray = [];
    return forEachItem(items, (item, i) => {
      if (isInView(item.triggerOffset)) returnArray.push(item);
      return (i === items.length - 1) && returnArray;
    }, GLOBALS.loadCount);
  }


  function runLoadSequence(items) {
    let counter = 0;
    const mediaQuery = GLOBALS.lastMediaQuery;
    const loadItem = item =>
      item && setItemSrc(item, mediaQuery)((number => loadItem(items[number]))(counter += 1));

    loadItem(items[counter]);
  }


  function loadItemsInView() {
    const g = GLOBALS;
    if (g.scrollListener && g.loadCount === g.items.length) {
      g.scrollListener = g.scrollListener.remove();
      return;
    }
    runLoadSequence(storeItemsInView(g.items));
  }


  function updateItems() {
    const g = GLOBALS;
    const mediaQuery = g.getMediaQuery.init();

    if (g.lastMediaQuery !== mediaQuery) {
      g.lastMediaQuery = mediaQuery;
      runLoadSequence(setPlaceholders(g.items, mediaQuery).filter(({ hasLoaded }) => hasLoaded));
    }

    if (g.scrollListener) {
      g.items = setTriggerOffsets(g.items);
      loadItemsInView();
    }
  }


  function initialize(elements) {
    const g = GLOBALS;
    Object.assign(g, {
      items: setupItems(elements),
      scrollListener: g.scrollListener || addEvent(window, 'scroll', _throttle(loadItemsInView, OPTIONS.checkInterval, { leading: false }))
    });
    updateItems(g);
  }


  return {
    init: () => initialize(getElement(document, `.${CLASSES.wrap}`, true)),
    update: () => updateItems(),
    reInit: function reInitialize() {
      Object.assign(GLOBALS, { lastMediaQuery: undefined, loadCount: 0 });
      this.init();
    }
  };
};

// EXPORT
module.exports = lazyImg;

