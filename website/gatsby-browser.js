/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

exports.onClientEntry = () => {
  // Check if the URL on load has a hash, and navigate to the position on page
  // if (window && window.document && window.location && window.location.hash) {
  //   const { location } = window;
  //   const el = window.document.getElementById(location.hash.replace('#', ''));
  //   if (el) {
  //     const rect = el.getBoundingClientRect();
  //     window.scrollTo(0, rect.top);
  //   }
  // }
};

exports.onPreRouteUpdate = () => {
  // Set the current sidebar scroll height on the window ready for the page change
  // const sidebar = window.document.getElementById('sidebar');
  // window.RNFB_SIDEBAR_SCROLL_POSITION = sidebar ? sidebar.scrollTop : 0;
};

exports.onRouteUpdate = () => {
  // Handle in-page hash change
  // if (location.hash) {
  //   const el = window.document.getElementById(location.hash.replace('#', ''));
  //   if (el) {
  //     const rect = el.getBoundingClientRect();
  //     window.scrollTo(0, rect.top);
  //   }
  // }
  // // Handle sidebar scroll position
  // const sidebar = window.document.getElementById('sidebar');
  // if (sidebar && window.RNFB_SIDEBAR_SCROLL_POSITION) {
  //   sidebar.scrollTop = window.RNFB_SIDEBAR_SCROLL_POSITION;
  // }
};
