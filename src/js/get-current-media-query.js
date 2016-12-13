/* exported GetCurrentMediaQuery */
function GetCurrentMediaQuery() {
  'use strict';
  
  const el = document.getElementById('js-breakpoint-hook'),
    queries = {
        screenSM: false,
        screenMD: false,
        screenLG: false
    };

  function init() {
    let counter = 1;
    const mqIndicator = el.offsetWidth;

    for (let query in queries) {
      queries[query] = (counter === mqIndicator) ? true : false;
      counter++;
    }
  }

  return {
    queries,
    init
  };
}