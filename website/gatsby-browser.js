exports.onClientEntry = () => {
  // Check if the URL on load has a hash, and navigate to the position on page
  if (window && window.document && window.location && window.location.hash) {
    const { location } = window;
    const el = window.document.getElementById(location.hash.replace('#', ''));

    if (el) {
      const rect = el.getBoundingClientRect();
      window.scrollTo(0, rect.top);
    }
  }
};

exports.onPreRouteUpdate = () => {
  // Set the current sidebar scroll height on the window ready for the page change
  const sidebar = window.document.getElementById('sidebar');
  window.RNFB_SIDEBAR_SCROLL_POSITION = sidebar ? sidebar.scrollTop : 0;
};

exports.onRouteUpdate = ({ location }) => {
  // Handle in-page hash change
  if (location.hash) {
    const el = window.document.getElementById(location.hash.replace('#', ''));

    if (el) {
      const rect = el.getBoundingClientRect();
      window.scrollTo(0, rect.top);
    }
  }

  // Handle sidebar scroll position
  const sidebar = window.document.getElementById('sidebar');
  if (sidebar && window.RNFB_SIDEBAR_SCROLL_POSITION) {
    sidebar.scrollTop = window.RNFB_SIDEBAR_SCROLL_POSITION;
  }
};
