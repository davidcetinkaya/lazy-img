/* exported Debounce */
function Debounce(fn, delay) {
  'use strict';

  let timer = null;

  return function() {
    const context = this, 
      args = arguments;

    clearTimeout(timer);
    
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}
