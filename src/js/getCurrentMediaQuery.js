/*
|------------------------------------------\
|  components --> GET CURRENT MEDIA QUERY
|------------------------------------------/
*/

/*
  Determines the current media query by getting the css width property of a specific HTML
  element which works as an indicator of which current media query is active in CSS.
*/

// MAIN
const getCurrentMediaQuery = (() => {
  const mediaQueryElement = document.getElementById('js-breakpoint-hook');
  const queries = ['xxs', 'xs', 'sm', 'md', 'lg'];

  return {
    init: () => queries[mediaQueryElement.offsetWidth],
    queries: (() => [...queries])()
  };
})();

// EXPORT
export default getCurrentMediaQuery;
