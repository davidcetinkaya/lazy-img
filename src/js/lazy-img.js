/*
|------------\
|  LAZY IMG
|------------/
*/

// DEPENDENCIES
import _throttle from 'lodash.throttle';
import getCurrentMediaQuery from './getCurrentMediaQuery';

// MAIN
const lazyImg = (options) => {
  // Global declarations
  const GLOBALS = {
    items: undefined,
    queueItems: undefined,
    resizeItems: undefined,
    scrollListener: undefined,
    lastMediaQuery: undefined,
    getMediaQuery: getCurrentMediaQuery
  };


  // Default options
  const OPTIONS = {
    setPlaceHolders: true,
    checkInterval: 500,
    lazyOffset: 0,
    classPrefix: 'js-lazy-img',
    onImgLoad: undefined
  };


  // Merge user options into defaults
  Object.assign(OPTIONS, options);


  // Classes
  const CLASSES = {
    wrap: `${OPTIONS.classPrefix}`,
    inner: `${OPTIONS.classPrefix}__inner`,
    img: `${OPTIONS.classPrefix}__img`
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


  function hasMultipleSizes(item) {
    const properties = ['Width', 'Height', 'Src'];
    return forEachItem(properties, (property) => {
      const size = getSuitableSize(item, 'xxs', property);
      return size && size !== item[`lg${property}`];
    });
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
    items.forEach(createPlaceHolder);
    return items;
  }


  function setLoadAndErrorListeners(item, img, size, callback) {
    const resizeItems = GLOBALS.resizeItems;
    const events = ['load', 'error'];
    const listeners = [];
    forEachItem(events, (event) => {
      listeners.push(addEvent(img, event, () => {
        if (resizeItems.indexOf(item) === -1 && hasMultipleSizes(item)) resizeItems.push(item);
        if (OPTIONS.onImgLoad) OPTIONS.onImgLoad(item.img, event === 'load');
        if (callback) callback();
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


  function filterItemsInView(items) {
    const isInView = isItemInView(window.pageYOffset);
    const itemsToLoad = items.filter(item => isInView(item.triggerOffset));
    const itemsToQueue = items.filter(item => itemsToLoad.indexOf(item) === -1);

    if (itemsToQueue.length) Object.assign(GLOBALS, { queueItems: itemsToQueue });
    return itemsToLoad;
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
    if (g.scrollListener && !g.queueItems.length) {
      g.scrollListener = g.scrollListener.remove();
      return;
    }
    runLoadSequence(filterItemsInView(g.queueItems));
  }


  function updateItems() {
    const g = GLOBALS;
    const mediaQuery = g.getMediaQuery.init();

    if (g.lastMediaQuery !== mediaQuery) {
      g.lastMediaQuery = mediaQuery;
      setPlaceholders(g.items, mediaQuery);
      if (g.resizeItems.length) runLoadSequence(g.resizeItems);
    }

    if (g.scrollListener) {
      g.queueItems = setTriggerOffsets(g.queueItems);
      loadItemsInView();
    }
  }


  function initialize(elements) {
    const g = GLOBALS;
    const items = setupItems(elements);
    Object.assign(g, {
      items,
      queueItems: items,
      resizeItems: [],
      scrollListener: g.scrollListener || addEvent(window, 'scroll',
        _throttle(loadItemsInView, OPTIONS.checkInterval, { leading: false })
      )
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

