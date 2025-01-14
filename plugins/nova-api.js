/*
   NOVA - complex solutions to simple problems
   full fusctions list in NOVA:
   - waitElement
   - waitUntil
   - watchElements
   - runOnPageInitOrTransition
   - css.push
   - css.getValue
   //- cookie.get
   //- cookie.getParamLikeObj
   //- cookie.updateParam
   - delay
   //- extractFirstInt
   - prettyRoundInt
   - isInViewport
   - collapseElement
   - aspectRatio.sizeToFit
   - aspectRatio.getAspectRatio
   - aspectRatio.getAspectRatioFromList
   - aspectRatio.calculateHeight
   - aspectRatio.calculateWidth
   - bezelTrigger
   - getChapterList
   - searchFilterHTML
   - isMusic
   - timeFormatTo.hmsToSec
   - timeFormatTo.HMS.digit
   - timeFormatTo.HMS.abbr
   //- timeFormatTo.HMS.abbrFull
   - timeFormatTo.ago
   - updateUrl
   - queryURL.has
   - queryURL.get
   - queryURL.set
   - queryURL.remove
   - request.API
   - getPlayerState
   - isFullscreen
   //- videoId
   - getChannelId
   //- seachInObjectBy.key

   // data (not fn)
   - videoElement
   - currentPage
   - isMobile
*/

const NOVA = {
   // DEBUG: true,

   // find once.
   // more optimized compared to MutationObserver
   // waitElement(selector = required()) {
   //    this.log('waitElement:', selector);
   //    if (typeof selector !== 'string') return console.error('wait > selector:', typeof selector);

   //    return new Promise((resolve, reject) => {
   //       // try {
   //       let nodeInterval
   //       const checkIfExists = () => {
   //          if (el = document.body.querySelector(selector)) {
   //             if (typeof nodeInterval === 'number') clearInterval(nodeInterval);
   //             resolve(el);

   //          } else return;
   //       }
   //       checkIfExists();
   //       nodeInterval = setInterval(checkIfExists, 50); // ms
   //       // } catch (err) { // does not output the reason/line to the stack
   //       //    reject(new Error('Error waitElement', err));
   //       // }
   //    });
   // },

   // waitElement(selector = required(), container) {
   //    if (typeof selector !== 'string') return console.error('wait > selector:', typeof selector);
   //    if (container && !(container instanceof HTMLElement)) return console.error('wait > container not HTMLElement:', container);
   //    // console.debug('waitElement:', selector);

   //    return Promise.resolve((container || document.body).querySelector(selector));
   // },

   /**
    * @param  {string} selector
    * @param  {HTMLElement*} container
    * @return {Promise<Element>}
   */
   // untilDOM
   waitElement(selector = required(), container) {
      if (typeof selector !== 'string') return console.error('wait > selector:', typeof selector);
      if (container && !(container instanceof HTMLElement)) return console.error('wait > container not HTMLElement:', container);
      // console.debug('waitElement:', selector);

      // https://stackoverflow.com/a/68262400
      // best https://codepad.co/snippet/wait-for-an-element-to-exist-via-mutation-observer
      // alt:
      // https://git.io/waitForKeyElements.js
      // https://github.com/fuzetsu/userscripts/tree/master/wait-for-elements
      // https://github.com/CoeJoder/waitForKeyElements.js/blob/master/waitForKeyElements.js
      // https://gist.githubusercontent.com/sidneys/ee7a6b80315148ad1fb6847e72a22313/raw/
      // https://greasyfork.org/scripts/21927-arrive-js/code/arrivejs.js  (ex: https://greasyfork.org/en/scripts/429783-confirm-and-upload-imgur)

      // There is a more correct method - transitionend.
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/transitionend_event
      // But this requires a change in the logic of the current implementation. It will also complicate the restoration of the expansion if in the future, if YouTube replaces logic.

      return new Promise(resolve => {
         if (element = (container || document.body || document).querySelector(selector)) {
            // console.debug('[1]', selector);
            return resolve(element);
         }

         new MutationObserver((mutationRecordsArray, observer) => {
            for (const record of mutationRecordsArray) {
               for (const node of record.addedNodes) {
                  if (![1, 3, 8].includes(node.nodeType) || !(node instanceof HTMLElement)) continue; // speedup hack

                  if (node.matches && node.matches(selector)) { // this node
                     // console.debug('[2]', record.type, node.nodeType, selector);
                     observer.disconnect();
                     return resolve(node);
                  }
                  else if ( // inside node
                     (parentEl = node.parentElement || node)
                     && (parentEl instanceof HTMLElement)
                     && (element = parentEl.querySelector(selector))
                  ) {
                     // console.debug('[3]', record.type, node.nodeType, selector);
                     observer.disconnect();
                     return resolve(element);
                  }
               }
            }
            // after loop. In global
            if (document?.readyState != 'loading' // fix slowdown page
               && (element = (container || document?.body || document).querySelector(selector))
            ) {
               // console.debug('[4]', selector);
               observer.disconnect();
               return resolve(element);
            }
         })
            .observe(container || document.body || document.documentElement || document, {
               childList: true, // observe direct children
               subtree: true, // and lower descendants too
            });
      });
   },

   /**
    * @param  {function} condition
    * @param  {int*} timeout
    * @return {Promise<fn>}
   */
   /** wait for every DOM change until a condition becomes true */
   // await NOVA.waitUntil(?, 500) // 500ms
   waitUntil(condition = required(), timeout = 100) {
      if (typeof condition !== 'function') return console.error('waitUntil > condition is not fn:', typeof condition);

      return new Promise((resolve) => {
         if (result = condition()) {
            // console.debug('waitUntil[1]', result, condition, timeout);
            resolve(result);
         }
         else {
            const interval = setInterval(() => {
               if (result = condition()) {
                  // console.debug('waitUntil[2]', result, condition, timeout);
                  clearInterval(interval);
                  resolve(result);
               }
               // console.debug('waitUntil[3]', result, condition, timeout);
            }, timeout);
         }
      });
   },

   watchElements_list: {}, // can to stop watch setInterval
   // complete doesn't work
   // clear_watchElements(name = required()) {
   //    return this.watchElements_list.hasOwnProperty(name)
   //       && clearInterval(this.watchElements_list[name])
   //       && delete this.watchElements_list[name];
   // },

   // alt:
   // https://github.com/uzairfarooq/arrive (https://greasyfork.org/scripts/21927-arrive-js/code/arrivejs.js)

   /**
    * @param  {array/string} condition
    * @param  {string*} attr_mark
    * @param  {function} callback
    * @return {void}
   */
   watchElements({ selectors = required(), attr_mark, callback = required() }) {
      // console.debug('watch', selector);
      if (!Array.isArray(selectors) && typeof selectors !== 'string') return console.error('watch > selector:', typeof selectors);
      if (typeof callback !== 'function') return console.error('watch > callback:', typeof callback);

      // async wait el. Removes the delay for init
      this.waitElement((typeof selectors === 'string') ? selectors : selectors.join(','))
         .then(video => {
            // selectors - str to array
            !Array.isArray(selectors) && (selectors = selectors.split(',').map(s => s.trim()));

            process(); // launch without waiting
            // if (attr_mark) {
            this.watchElements_list[attr_mark] = setInterval(() =>
               document.visibilityState == 'visible' && process(), 1000 * 1.5); // 1.5 sec
            // }

            function process() {
               // console.debug('watch.process', { selector, callback });
               selectors
                  .forEach(selectorItem => {
                     if (attr_mark) selectorItem += `:not([${attr_mark}])`;
                     // if ((slEnd = ':not([hidden])') && !selectorItem.endsWith(slEnd)) {
                     //    selectorItem += slEnd;
                     // }
                     // console.debug('selectorItem', selectorItem);

                     document.body.querySelectorAll(selectorItem)
                        .forEach(el => {
                           // if (el.offsetWidth > 0 || el.offsetHeight > 0) { // el.is(":visible")
                           // console.debug('watch.process.viewed', selectorItem);
                           if (attr_mark) el.setAttribute(attr_mark, true);
                           callback(el);
                           // }
                        });
                  });
            }
         });

   },

   /**
    * @param  {function} callback
    * @return {void}
   */
   runOnPageInitOrTransition(callback) {
      if (!callback || typeof callback !== 'function') {
         return console.error('runOnPageInitOrTransition > callback not function:', ...arguments);
      }
      let prevURL = location.href;
      const isURLChange = () => (prevURL === location.href) ? false : prevURL = location.href;
      // init
      isURLChange() || callback();
      // update
      // window.addEventListener('transitionend', () => isURLChange() && callback());
      document.addEventListener('yt-navigate-finish', () => isURLChange() && callback());
   },

   /**
    * @param  {obj/string} css
    * @param  {string*} selector
    * @param  {boolean*} important
    * @return {void}
   */
   css: {
      push(css = required(), selector, important) {
         // console.debug('css\n', ...arguments);
         if (typeof css === 'object') {
            if (!selector) return console.error('injectStyle > empty json-selector:', ...arguments);

            // if (important) {
            injectCss(selector + json2css(css));
            // } else {
            //    Object.assign(document.body.querySelector(selector).style, css);
            // }

            function json2css(obj) {
               let css = '';
               Object.entries(obj)
                  .forEach(([key, value]) => {
                     css += key + ':' + value + (important ? ' !important' : '') + ';';
                  });
               return `{ ${css} }`;
            }
         }
         else if (css && typeof css === 'string') {
            if (document.head) {
               injectCss(css);
            }
            else {
               window.addEventListener('load', () => injectCss(css), { capture: true, once: true });
            }
         }
         else {
            console.error('addStyle > css:', typeof css);
         }

         function injectCss(source = required()) {
            let sheet;

            if (source.endsWith('.css')) {
               sheet = document.createElement('link');
               sheet.rel = 'sheet';
               sheet.href = source;
            }
            else {
               const sheetId = 'NOVA-style';
               sheet = document.getElementById(sheetId) || (function () {
                  const style = document.createElement('style');
                  style.type = 'text/css';
                  style.id = sheetId;
                  return (document.head || document.documentElement).appendChild(style);
               })();
            }

            sheet.textContent += '/**/\n' + source
               .replace(/\n+\s{2,}/g, ' ') // singleline format
               // multiline format
               // .replace(/\n+\s{2,}/g, '\n\t')
               // .replace(/\t\}/mg, '}')
               + '\n';
            // sheet.insertRule(css, sheet.cssRules.length);
            // (document.head || document.documentElement).append(sheet);
            // document.adoptedStyleSheets.push(newSheet); // v99+

            // sheet.onload = () => NOVA.log('style loaded:', sheet.src || sheet || sheet.textContent.substr(0, 100));
         }
      },

      /**
       * @param  {string} selector
       * @param  {string} prop_name
       * @param  {boolean} int
       * @return {string}
      */
      // https://developer.mozilla.org/ru/docs/Web/API/CSSStyleDeclaration
      // HTMLElement.prototype.getIntValue = () {}
      // const { position, right, bottom, zIndex, boxShadow } = window.getComputedStyle(container); // multiple
      getValue(selector = required(), prop_name = required()) {
         return (el = document.body?.querySelector(selector))
            ? getComputedStyle(el).getPropertyValue(prop_name) : null; // for some callback functions (Match.max) return "undefined" is not valid
      },
   },

   // cookie: {
   //    get(name = required()) {
   //       return Object.fromEntries(
   //          document.cookie
   //             .split(/; */)
   //             .map(c => {
   //                const [key, ...v] = c.split('=');
   //                return [key, decodeURIComponent(v.join('='))];
   //             })
   //       )[name];
   //    },

   //    set(name = required(), value, days = 90) { // 90 days
   //       if (this.get(name) == value) return;

   //       let date = new Date();
   //       date.setTime(date.getTime() + 3600000 * 24 * days); // m*h*d

   //       document.cookie = Object.entries({
   //          [encodeURIComponent(name)]: value,
   //          // domain: '.' + location.hostname.split('.').slice(-2).join('.'),  // "www.youtube.com" => ".youtube.com"
   //          domain: location.hostname,
   //          expires: date.toUTCString(),
   //          path: '/', // what matters at the end
   //       })
   //          .map(([key, value]) => `${key}=${value}`).join('; '); // if no "value" = undefined

   //       console.assert(this.get(name) == value, 'cookie set err:', ...arguments, document.cookie);
   //    },

   //    getParamLikeObj(name = required()) {
   //       return Object.fromEntries(
   //          this.get(name)
   //             ?.split(/&/)
   //             .map(c => {
   //                const [key, ...v] = c.split('=');
   //                return [key, decodeURIComponent(v.join('='))];
   //             }) || []
   //       );
   //    },

   //    updateParam({ key = required(), param = required(), value = required() }) {
   //       let paramsObj = this.getParamLikeObj(key) || {};

   //       if (paramsObj[param] != value) {
   //          paramsObj[param] = value;
   //          this.set(key, NOVA.queryURL.set(paramsObj).split('?').pop());
   //          location.reload();
   //       }
   //    },
   // },

   // await NOVA.delay(500);
   delay(ms = 100) {
      return new Promise(resolve => setTimeout(resolve, ms));
   },

   // extractFirstInt: str => str && parseInt(str.replace(/\D/g, ''), 10),

   /**
    * @param  {integer/string} num
    * @return {string}
   */
   // prettyRoundInt(num) { // conver number "2111" > "2K" (without decimals)
   //    num = +num;
   //    if (num === 0) return '';
   //    else if (num < 1000) return num;
   //    else if (num < 990000) return Math.max(1, Math.round(num / 1000)) + 'K'; // K on youtube are never decimals
   //    else if (num < 990000000) return Math.max(1, Math.round(num / 100000) / 10) + 'M';
   //    else return Math.max(1, Math.round(num / 100000000) / 10) + 'B';
   // },
   // 81.46% slower
   prettyRoundInt(num) { // conver number "2111" > "2.1K"
      num = +num;
      if (num === 0) return '';
      if (num < 1000) return num; // speed up
      const sizes = ['', 'K', 'M', 'B'];
      const i = Math.floor(Math.log(Math.abs(num)) / Math.log(1000));
      if (!sizes[i]) return num; // out range

      return round(num / 1000 ** i, 1) + sizes[i];

      function round(n, precision = 2) {
         const prec = 10 ** precision;
         return Math.floor(n * prec) / prec;
      }
   },

   /**
    * @param  {HTMLElement} el
    * @return  {boolean}
   */
   isInViewport(el = required()) {
      if (!(el instanceof HTMLElement)) return console.error('el is not HTMLElement type:', el);

      if (bounding = el.getBoundingClientRect()) {
         return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= window.innerHeight &&
            bounding.right <= window.innerWidth
         );
      }
   },

   /* NOVA.collapseElement({
         selector: '#secondary #related',
         title: 'related',// auto uppercase
         remove: true,
         remove: (user_settings.NAME_visibility_mode == 'remove') ? true : false,
   }); */
   /**
    * @param  {string} selector
    * @param  {string} title
    * @param  {boolean} remove
    * @return {void}
   */
   collapseElement({ selector = required(), title = required(), remove }) {
      // console.debug('collapseElement', ...arguments);
      const selector_id = `${title.match(/[a-z]+/gi).join('')}-prevent-load-btn`;

      this.waitElement(selector.toString())
         .then(el => {
            if (remove) el.remove();
            else {
               if (document.getElementById(selector_id)) return;
               // el.style.visibility = 'hidden'; // left scroll space
               el.style.display = 'none';
               // create button
               const btn = document.createElement('a');
               btn.textContent = `Load ${title}`;
               btn.id = selector_id;
               btn.className = 'more-button style-scope ytd-video-secondary-info-renderer';
               // btn.className = 'ytd-vertical-list-renderer';
               Object.assign(btn.style, {
                  cursor: 'pointer',
                  'text-align': 'center',
                  'text-transform': 'uppercase',
                  display: 'block',
                  color: 'var(--yt-spec-text-secondary)',
               });
               btn.addEventListener('click', () => {
                  btn.remove();
                  // el.style.visibility = 'visible'; // left scroll space
                  el.style.display = 'unset';
                  window.dispatchEvent(new Event('scroll')); // need to "comments-visibility" (https://stackoverflow.com/a/68202306)
               });
               el.before(btn);
            }
         });
   },

   aspectRatio: {
      /**
       * @param  {object} 4 int
       * @return {object} 2 int
      */
      sizeToFit({
         srcWidth = 0, srcHeight = 0,
         maxWidth = window.innerWidth, maxHeight = window.innerHeight
      }) {
         // console.debug('aspectRatioFit:', ...arguments);
         const aspectRatio = Math.min(+maxWidth / +srcWidth, +maxHeight / +srcHeight);
         return {
            width: +srcWidth * aspectRatio,
            height: +srcHeight * aspectRatio,
         };
      },

      /**
       * @param  {object} 2 int
       * @return {object} string
      */
      // extractRatio({ width = required(), height = required() }) {
      getAspectRatio({ width = required(), height = required() }) {
         const
            gcd = (a, b) => b ? gcd(b, a % b) : a,
            divisor = gcd(width, height);

         return width / divisor + ':' + height / divisor;
      },

      /**
       * @param  {object} 2 int
       * @return {int}
      */
      chooseAspectRatio({ width = required(), height = required(), layout }) {
         // from list ['4:3', '16:9']
         // const ratio = width / height;
         // return (Math.abs(ratio - 4 / 3) < Math.abs(ratio - 16 / 9)) ? '4:3' : '16:9';

         const acceptedRatioList = {
            'landscape': {
               '1:1': 1,
               '3:2': 1.5,
               '4:3': 1.33333333333,
               '5:4': 1.25,
               '5:3': 1.66666666667,
               '16:9': 1.77777777778,
               '16:10': 1.6,
               '17:9': 1.88888888889,
               '21:9': 2.33333333333,
               '24:10': 2.4,
            },
            'portrait': {
               '1:1': 1,
               '2:3': .66666666667,
               '3:4': .75,
               '3:5': .6,
               '4:5': .8,
               '9:16': .5625,
               '9:17': .5294117647,
               '9:21': .4285714286,
               '10:16': .625,
            },
         };
         return choiceRatioFromList(this.getAspectRatio(...arguments)) || acceptedRatioList['landscape']['16:9'];

         function choiceRatioFromList(ratio = required()) {
            const layout_ = layout || ((ratio < 1) ? 'portrait' : 'landscape');
            return acceptedRatioList[layout_][ratio];
         }
      },

      /**
       * @param  {height|width} int
       * @param  {aspectRatio*} int
       * @return {int}
       * source - https://codepen.io/codemediaweb/pen/OJjmwNJ
      */
      calculateHeight: (width = required(), aspectRatio = (16 / 9)) => parseFloat((width / aspectRatio).toFixed(2)),
      calculateWidth: (height = required(), aspectRatio = (16 / 9)) => parseFloat((height * aspectRatio).toFixed(2)),
      // universale
      // fitToSize({ width, height, aspectRatio = (16 / 9) }) {
      // sizeToRatio({ width, height, aspectRatio = (16 / 9) }) {
      //    if (ratio = width ? (height / aspectRatio) : width ? (height / aspectRatio) : null) {
      //       return parseFloat(ratio).toFixed(2);
      //    }
      // },
   },

   /**
    * @param  {string} text
    * @return {void}
   */
   bezelTrigger(text) {
      // console.debug('bezelTrigger', ...arguments);
      if (!text) return;
      if (typeof this.fateBezel === 'number') clearTimeout(this.fateBezel); // reset hide
      const bezelEl = document.body.querySelector('.ytp-bezel-text');
      if (!bezelEl) return console.warn(`bezelTrigger ${text}=>${bezelEl}`);

      const
         bezelContainer = bezelEl.parentElement.parentElement,
         BEZEL_SELECTOR_TOGGLE = '.ytp-text-root';

      if (!this.bezel_css_inited) {
         this.bezel_css_inited = true;
         this.css.push(
            `${BEZEL_SELECTOR_TOGGLE} { display: block !important; }
            ${BEZEL_SELECTOR_TOGGLE} .ytp-bezel-text-wrapper {
               pointer-events: none;
               z-index: 40 !important;
            }
            ${BEZEL_SELECTOR_TOGGLE} .ytp-bezel-text { display: inline-block !important; }
            ${BEZEL_SELECTOR_TOGGLE} .ytp-bezel { display: none !important; }`);
      }

      bezelEl.textContent = text;
      bezelContainer.classList.add(BEZEL_SELECTOR_TOGGLE);

      this.fateBezel = setTimeout(() => {
         bezelContainer.classList.remove(BEZEL_SELECTOR_TOGGLE);
         bezelEl.textContent = ''; // fix not showing bug when frequent calls
      }, 600); // 600ms
   },

   /**
    * @param  {int} video_duration
    * @return {array}
   */
   getChapterList(video_duration = required()) {
      // Strategy 1
      if (NOVA.currentPage != 'embed'
         && (chapsCollect = getFromDescriptionText() || getFromDescriptionChaptersBlock()) // Doesn't work in embed
         && chapsCollect.length
      ) {
         return chapsCollect;
      }
      // Strategy 2
      else {
         chapsCollect = getFromAPI();
      }
      // console.debug('chapsCollect', chapsCollect);
      return chapsCollect;


      function getFromDescriptionText() {
         const selectorTimestampLink = 'a[href*="&t="]';
         let
            timestampsCollect = [],
            nowComment,
            prevSec = -1;

         [
            // description
            (
               document.body.querySelector('ytd-watch-flexy')?.playerData?.videoDetails.shortDescription
               || document.body.querySelector('ytd-watch-metadata #description.ytd-watch-metadata')?.textContent
            ),

            // first comment (pinned)
            // '#comments ytd-comment-thread-renderer:first-child #content',
            // all comments
            // Strategy 1. To above v105 https://developer.mozilla.org/en-US/docs/Web/CSS/:has
            //...[...document.body.querySelectorAll(`#comments #comment #comment-content:has(${selectorTimestampLink})`)]
            // Strategy 2
            ...[...document.body.querySelectorAll(`#comments #comment #comment-content ${selectorTimestampLink} + *:last-child`)]
               // .map(el => el.closest('#comment')?.textContent),
               .map(el => ({
                  'source': 'comment',
                  'text': el.closest('#comment-content')?.textContent,
               })),
         ]
            .forEach(data => {
               if (timestampsCollect.length > 1) return; // skip if exist in priority selector (#1 description, #2 comments)
               // needed for check, applying sorting by timestamps
               nowComment = Boolean(data?.source);

               (data?.text || data)
                  ?.split('\n')
                  .forEach(line => {
                     line = line?.toString().trim(); // clear spaces
                     if (line.length > 5 && line.length < 200 && (timestamp = /((\d?\d:){1,2}\d{2})/g.exec(line))) {
                        // console.debug('line', line);
                        timestamp = timestamp[0]; // ex:"0:00"
                        const
                           sec = NOVA.timeFormatTo.hmsToSec(timestamp),
                           timestampPos = line.indexOf(timestamp);

                        if (
                           // fix invalid sort timestamp
                           // ex: https://www.youtube.com/watch?v=S66Q7T7qqxU https://www.youtube.com/watch?v=nkyXwDU97ms
                           (nowComment ? true : (sec > prevSec && sec < +video_duration))
                           // not in the middle of the line
                           && (timestampPos < 5 || (timestampPos + timestamp.length) === line.length)
                        ) {
                           if (nowComment) prevSec = sec;

                           timestampsCollect.push({
                              'sec': sec,
                              'time': timestamp,
                              'title': line
                                 .replace(timestamp, '')
                                 .trim().replace(/^[:\-–—|]|(\[\])?|[:\-–—.;|]$/g, '') // clear of quotes and list characters
                                 //.trim().replace(/^([:\-–—|]|(\d+[\.)]))|(\[\])?|[:\-–—.;|]$/g, '') // clear numeric list prefix
                                 // ^[\"(]|[\")]$ && .trim().replace(/^[\"(].*[\")]$/g, '') // quote stripping example - "text"
                                 .trim()
                           });
                        }
                     }
                  });
            });

         // if 1 mark < 25% video_duration
         if (timestampsCollect.length == 1 && timestampsCollect[0].sec < (video_duration / 4)) {
            return timestampsCollect;
         }
         else if (timestampsCollect.length > 1) {
            if (nowComment) {
               // apply sort by sec (ex: https://www.youtube.com/watch?v=kXsAqdwB52o&lc=Ugx0zm8M0iSAFNvTV_R4AaABAg)
               timestampsCollect = timestampsCollect.sort((a, b) => a.sec - b.sec);
            }
            // console.debug('timestampsCollect', timestampsCollect);
            return timestampsCollect;
         }
      }

      async function getFromDescriptionChaptersBlock() {
         await NOVA.delay(500); // firty fix. Wait load all chapters

         const selectorTimestampLink = 'a[href*="&t="]';
         let timestampsCollect = [];
         document.body.querySelectorAll(`#structured-description ${selectorTimestampLink}`)
            // document.body.querySelectorAll(`#description.ytd-watch-metadata ${selectorTimestampLink}`)
            .forEach(chaperLink => {
               // console.debug('>', chaperLink);
               if (sec = parseInt(NOVA.queryURL.get('t', chaperLink.href))) {
                  timestampsCollect.push({
                     'time': NOVA.timeFormatTo.HMS.digit(sec),
                     'sec': sec,
                     'title': chaperLink.textContent.trim().split('\n')[0].trim(),
                     // in #structured-description
                     // 'time': chaperLink.querySelector('#time')?.textContent,
                     // 'title': chaperLink.querySelector('h4')?.textContent,
                  });
               }
            });
         // if 1 mark < 25% video_duration. Ex skip intro info in comment
         if (timestampsCollect.length == 1 && timestampsCollect[0].sec < (video_duration / 4)) {
            return timestampsCollect;
         }
         else if (timestampsCollect.length > 1) {
            // console.debug('timestampsCollect', timestampsCollect);
            return timestampsCollect;
         }
      }

      function getFromAPI() {
         // console.debug('getFromAPI');
         if (!window.ytPubsubPubsubInstance) {
            return console.warn('ytPubsubPubsubInstance is null:', ytPubsubPubsubInstance);
         }

         const data = Object.values((
            ytPubsubPubsubInstance.i // embed
            || ytPubsubPubsubInstance.j // watch
            || ytPubsubPubsubInstance.subscriptions_ // navigation
         )
            .find(a => a?.player)
            .player.app
         )
            .find(a => a?.videoData)
            ?.videoData.multiMarkersPlayerBarRenderer;

         if (data?.markersMap?.length) {
            return data.markersMap[0].value.chapters
               ?.map(c => {
                  const sec = +c.chapterRenderer.timeRangeStartMillis / 1000;
                  return {
                     'sec': sec,
                     'time': NOVA.timeFormatTo.HMS.digit(sec),
                     'title':
                        c.chapterRenderer.title.simpleText // watch
                        || c.chapterRenderer.title.runs[0].text, // embed
                  };
               });
         }
      }
   },

   // there are problems with the video https://www.youtube.com/watch?v=SgQ_Jk49FRQ. Too lazy to continue testing because it is unclear which method is more optimal.
   // getChapterList(video_duration = required()) {
   //    const selectorLinkTimestamp = 'a[href*="&t="]';
   //    let timestampList = [];
   //    let prevSec = -1;

   //    document.body.querySelectorAll(`ytd-watch-metadata #description ${selectorLinkTimestamp}, #contents ytd-comment-thread-renderer:first-child #content ${selectorLinkTimestamp}`)
   //       .forEach((link, i, arr) => {
   //          // const prev = arr[i-1] || -1; // needs to be called "hmsToSecondsOnly" again. What's not optimized
   //          const sec = parseInt(this.queryURL.get('t', link.href), 10);
   //          if (sec > prevSec && sec < +video_duration) {
   //             prevSec = sec;
   //             // will be skip - time: '0:00'
   //             timestampList.push({
   //                // num: ++i,
   //                sec: sec,
   //                time: link.textContent,
   //                title: link.parentElement.textContent
   //                   .split('\n')
   //                   .find(line => line.includes(link.textContent))
   //                   .replaceAll(link.textContent, '')
   //                   .trim()
   //                   .replace(/(^[:\-–—]|[:\-–—.;]$)/g, '')
   //                   .trim()
   //             });
   //          }
   //       });
   //    console.debug('timestampList', timestampList);

   //    if (timestampList?.length > 1) { // clear from "lying timestamp"
   //       return timestampList.filter(i => i.title.length < 80);
   //    }
   // },

   /**
    * @param  {string} keyword
    * @param  {string} filter_selectors
    * @param  {boolean*} highlight_selector
    * @return {void}
   */
   searchFilterHTML({ keyword = required(), filter_selectors = required(), highlight_selector }) {
      // console.debug('searchFilterHTML:', ...arguments);
      keyword = keyword.toString().toLowerCase();

      document.body.querySelectorAll(filter_selectors)
         .forEach(item => {
            const
               text = item.textContent,
               // text = item.innerText,
               // text = item.querySelector(highlight_selector).getAttribute('title'),
               hasText = text?.toLowerCase().includes(keyword),
               highlight = el => {
                  if (el.innerHTML.includes('<mark ')) {
                     // el.innerHTML = el.textContent
                     el.innerHTML = el.innerHTML
                        .replace(/<\/?mark[^>]*>/g, ''); // clear highlight tags
                  }
                  item.style.display = hasText ? '' : 'none'; // hide el out of search
                  if (hasText && keyword) {
                     highlightTerm({
                        'target': el,
                        'keyword': keyword,
                        // 'highlightClass':,
                     });
                  }
               };

            (highlight_selector ? item.querySelectorAll(highlight_selector) : [item])
               .forEach(highlight);
         });

      function highlightTerm({ target = required(), keyword = required(), highlightClass }) {
         // console.debug('highlightTerm:', ...arguments);
         const
            content = target.innerHTML,
            pattern = new RegExp('(>[^<.]*)?(' + keyword + ')([^<.]*)?', 'gi'),
            highlightStyle = highlightClass ? `class="${highlightClass}"` : 'style="background-color:#afafaf"',
            replaceWith = `$1<mark ${highlightStyle}>$2</mark>$3`,
            marked = content.replaceAll(pattern, replaceWith);

         return (target.innerHTML = marked) !== content;
      }
   },

   /**
    * @return {boolean}
   */
   // isMusicChannel() {
   isMusic() {
      return checkMusicType();
      // const
      //    CACHE_PREFIX = 'nova-music-type',
      //    cacheName = CACHE_PREFIX + ':' + (this.queryURL.get('v') || movie_player.getVideoData().video_id);

      // // fix (Disable cache) - Failed to read the 'sessionStorage' property from 'Window': Access is denied for this document.
      // if (!navigator.cookieEnabled && this.currentPage == 'embed') return checkMusicType();

      // if (storage = sessionStorage.getItem(cacheName)) {
      //    // console.debug(CACHE_PREFIX, 'cache:', storage);
      //    return JSON.parse(storage);
      // }
      // save
      // else {
      //    const state = checkMusicType();
      //    // console.debug(CACHE_PREFIX, 'gen:', state);
      //    sessionStorage.setItem(cacheName, Boolean(state));
      //    return state;
      // }

      // document.addEventListener('yt-page-data-updated', () => {
      //    checkMusicType();
      // });

      function checkMusicType() {
         // await NOVA.waitUntil(() => typeof movie_player === 'object');
         const
            // channelName = document.body.querySelector('#upload-info #channel-name a:not(:empty)')?.textContent,
            // channelName = document.body.querySelector('ytd-watch-flexy')?.playerData?.videoDetails.author,
            // channelName = document.body.querySelector('ytd-watch-flexy')?.playerData?.microformat?.playerMicroformatRenderer.ownerChannelName,
            channelName = movie_player.getVideoData().author,
            titleStr = movie_player.getVideoData().title.toUpperCase(),
            titleWordsList = titleStr?.toUpperCase().match(/\w+/g), // UpperCase
            playerData = document.body.querySelector('ytd-watch-flexy')?.playerData;

         // if (user_settings.rate_default_apply_music == 'expanded') {
         //    // 【MAD】,『MAD』,「MAD」
         //    // warn false finding ex: "AUDIO visualizer" 'underCOVER','VOCALoid','write THEME','UI THEME','photo ALBUM', 'lolyPOP', 'ascENDING', speeED, 'LapOP' 'Ambient AMBILIGHT lighting', 'CD Projekt RED', 'Remix OS, TEASER
         //    if (titleStr.split(' - ').length === 2  // search for a hyphen. Ex.:"Artist - Song"
         //       || ['【', '『', '「', 'REMIX', 'CD', 'AUDIO', 'EXTENDED', 'FULL', 'TOP', 'TRACK', 'TRAP', 'THEME', 'PIANO', 'POP', '8-BIT'].some(i => titleWordsList?.map(w => w.toUpperCase()).includes(i))
         //    ) {
         //       return true;
         //    }
         // }

         return [
            titleStr,
            location.href, // 'music.youtube.com' or 'youtube.com#music'
            channelName,
            // video genre
            playerData?.microformat?.playerMicroformatRenderer.category, // exclude embed page
            // playlistTitle
            playerData?.title, // ex. - https://www.youtube.com/watch?v=cEdVLDfV1e0&list=PLVrIzE02N3EE9mplAPO8BGleeenadCSNv&index=2

            // ALL BELOW - not updated after page transition!
            // window.ytplayer?.config?.args.title,
            // document.body.querySelector('meta[itemprop="genre"][content]')?.content,
            // window.ytplayer?.config?.args.raw_player_response.microformat?.playerMicroformatRenderer.category,
            // document.body.querySelector('ytd-player')?.player_?.getCurrentVideoConfig()?.args.raw_player_response?.microformat.playerMicroformatRenderer.category
         ]
            .some(i => i?.toUpperCase().includes('MUSIC'))

            // 'Official Artist' badge
            || document.body.querySelector('#upload-info #channel-name .badge-style-type-verified-artist')
            // https://yt.lemnoslife.com/channels?part=approval&id=CHANNEL_ID (items[0].approval == 'Official Artist Channel') (https://github.com/Benjamin-Loison/YouTube-operational-API)

            // channelNameVEVO
            || (channelName && /(VEVO|Topic|Records|AMV)$/.test(channelName)) // https://www.youtube.com/channel/UCHV1I4axw-6pCeQTUu7YFhA, https://www.youtube.com/@FIRESLARadio

            // specific word in channel
            || (channelName && /(MUSIC|ROCK|SOUNDS|SONGS)/.test(channelName.toUpperCase())) // https://www.youtube.com/channel/UCj-Wwx1PbCUX3BUwZ2QQ57A https://www.youtube.com/@RelaxingSoundsOfNature

            // word
            || titleWordsList?.length && ['🎵', '♫', 'SONG', 'SOUND', 'SONGS', 'SOUNDTRACK', 'LYRIC', 'LYRICS', 'AMBIENT', 'MIX', 'VEVO', 'CLIP', 'KARAOKE', 'OPENING', 'COVER', 'COVERED', 'VOCAL', 'INSTRUMENTAL', 'ORCHESTRAL', 'DNB', 'BASS', 'BEAT', 'HITS', 'ALBUM', 'PLAYLIST', 'DUBSTEP', 'CHILL', 'RELAX', 'CLASSIC', 'CINEMATIC']
               .some(i => titleWordsList.includes(i))

            // words
            || ['OFFICIAL VIDEO', 'OFFICIAL AUDIO', 'FEAT.', 'FT.', 'LIVE RADIO', 'DANCE VER', 'HIP HOP', 'ROCK N ROLL', 'HOUR VER', 'HOURS VER', 'INTRO THEME'] // 'FULL ALBUM'
               .some(i => titleStr.includes(i))

            // word (case sensitive)
            || titleWordsList?.length && ['OP', 'ED', 'MV', 'PV', 'OST', 'NCS', 'BGM', 'EDM', 'GMV', 'AMV', 'MMD', 'MAD']
               .some(i => titleWordsList.includes(i));
      }
   },

   // findTimestamps(text) {
   //    const result = []
   //    const timestampPattern = /((\d?\d:){1,2}\d{2})/g
   //    let match
   //    while ((match = timestampPattern.exec(text))) {
   //       result.push({
   //          from: match.index,
   //          to: timestampPattern.lastIndex
   //       })
   //    }
   //    return result
   // },

   // dateFormatter
   timeFormatTo: {
      /**
       * 00:00:00形式の時間を秒に変換する
       *
       * @param  {string} str
       * @return {int}
      */
      // 13.19% slower
      // hmsToSec(str) { // format out "h:mm:ss" > "sec"
      //    // str = ':00:00am'; // for test
      //    if ((arr = str?.split(':')) && arr.length) {
      //       return arr.reduce((acc, time) => (60 * acc) + +time);
      //    }
      // },
      hmsToSec(str) { // format out "h:mm:ss" > "sec". if str dont have ":" return zero
         let
            parts = str?.split(':'),
            t = 0;
         switch (parts?.length) {
            case 2: t = (parts[0] * 60); break;
            case 3: t = (parts[0] * 60 * 60) + (parts[1] * 60); break;
            case 4: t = (parts[0] * 24 * 60 * 60) + (parts[1] * 60 * 60) + (parts[2] * 60); break;
         }
         return t + +parts.pop();
      },

      HMS: {
         /**
          * @param  {int} time_sec
          * @return {string}
         */
         // 65.77 % slower
         // digit(ts = required()) { // format out "h:mm:ss"
         //    const
         //       ts = Math.abs(+ts),
         //       days = Math.floor(ts / 86400);

         //    let t = new Date(ts).toISOString();
         //    if (ts < 3600000) t = t.substr(14, 5); // add hours
         //    else t = t.substr(11, 8); // only minutes

         //    return (days ? `${days}d ` : '') + t;
         // },
         digit(time_sec = required()) { // format out "h:mm:ss"
            const
               ts = Math.abs(+time_sec),
               d = ~~(ts / 86400),
               h = ~~((ts % 86400) / 3600),
               m = ~~((ts % 3600) / 60),
               // min = ~~(Math.log(sec) / Math.log(60)), // after sec
               s = Math.floor(ts % 60);

            return (d ? `${d}d ` : '')
               + (h ? (d ? h.toString().padStart(2, '0') : h) + ':' : '')
               + (h ? m.toString().padStart(2, '0') : m) + ':'
               + s.toString().padStart(2, '0');

            // 84% slower
            // return (days && !isNaN(days) ? `${days}d ` : '')
            //    + [hours, minutes, seconds]
            //       .filter(i => +i && !isNaN(i))
            //       .map((item, idx) => idx ? item.toString().padStart(2, '0') : item) // "1:2:3" => "1:02:03"
            //       .join(':'); // format "h:m:s"
         },

         /**
          * @param  {int} time_sec
          * @return {string}
         */
         abbr(time_sec = required()) { // format out "999h00m00s"
            const
               ts = Math.abs(+time_sec),
               d = ~~(ts / 86400),
               h = ~~((ts % 86400) / 3600),
               m = ~~((ts % 3600) / 60),
               // min = ~~(Math.log(sec) / Math.log(60)), // after sec
               s = Math.floor(ts % 60);

            return (d ? `${d}d ` : '')
               + (h ? (d ? h.toString().padStart(2, '0') : h) + 'h' : '')
               + (m ? (h ? m.toString().padStart(2, '0') : m) + 'm' : '')
               + (s ? (m ? s.toString().padStart(2, '0') : s) + 's' : '');
            // 81.34 % slower
            // const ts = Math.abs(+time_sec);
            // return [
            //    days = { label: 'd', time: ~~(ts / 86400) },
            //    hours = { label: 'h', time: ~~((ts % 86400) / 3600) },
            //    minutes = { label: 'm', time: ~~((ts % 3600) / 60) },
            //    // { label: 's', time: ~~(Math.log(sec) / Math.log(60)) },
            //    seconds = { label: 's', time: Math.floor(ts % 60) },
            // ]
            //    .map((i, idx, arr) =>
            //       (i.time ? (arr[idx - 1] ? i.time.toString().padStart(2, '0') : i.time) + i.label : '')
            //    )
            //    .join('');
         },

         /**
          * @param  {ts} int
          * @return {string}
         */
         // abbrFull(ts) {
         //    const plural = (amount, name) => {
         //       return (amount == 1 ? '1 ' + name : amount + ' ' + name + 's');
         //    };
         //    const pluralandplural = (amount1, name1, amount2, name2) => {
         //       return plural(amount1, name1) + (amount2 == 0 ? '' : ' and ' + plural(amount2, name2));
         //    };

         //    if (ts >= 86400) {
         //       const
         //          days = Math.floor(ts / 86400),
         //          hours = Math.round(ts / 3600 - days * 24);
         //       return pluralandplural(days, 'day', hours, 'hour');
         //    }
         //    else if (ts >= 3600) {
         //       const
         //          hours = Math.floor(ts / 3600),
         //          minutes = Math.round(ts / 60 - hours * 60);
         //       return pluralandplural(hours, 'hour', minutes, 'min');
         //    }
         //    else if (ts >= 60) {
         //       const
         //          minutes = Math.floor(ts / 60),
         //          seconds = Math.round(ts - minutes * 60);
         //       return pluralandplural(minutes, 'min', seconds, 'sec');
         //    }
         //    else {
         //       const seconds = Math.max(0, Math.floor(ts));
         //       return plural(seconds, 'second');
         //    }
         // },
      },

      /**
       * @param  {date} date
       * @return {string}
      */
      // timeSince(date = required()) { // format out "1 day"
      ago(date = required()) { // format out "1 day"
         if (!(date instanceof Date)) return console.error('"date" is not Date type:', date);

         const samples = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
         ];
         const
            now = date.getTime(),
            seconds = Math.floor((Date.now() - Math.abs(now)) / 1000),
            interval = samples.find(i => i.seconds < seconds),
            time = Math.floor(seconds / interval.seconds);

         // return `${time} ${interval.label}${time !== 1 ? 's' : ''} ago`;
         return `${(now < 0 ? '-' : '') + time} ${interval.label}${time !== 1 ? 's' : ''}`;
      },
   },

   /**
    * @param  {string} new_url
    * @return {void}
   */
   updateUrl: (new_url = required()) => window.history.replaceState(null, null, new_url),

   queryURL: {
      // const videoId = new URLSearchParams(window.location.search).get('v');
      // get: (query, url) => new URLSearchParams((url ? new URL(url) : location.href || document.URL).search).get(query),
      // has: (query = required(), url_string) => new URLSearchParams((url_string ? new URL(url_string) : location.href)).has(query), // Doesn't work

      has: (query = required(), url_string) => new URL(url_string || location).searchParams.has(query.toString()),

      get: (query = required(), url_string) => new URL(url_string || location).searchParams.get(query.toString()),

      /**
       * @param  {object} query_obj
       * @param  {string*} url_string
       * @return {string}
      */
      set(query_obj = {}, url_string) {
         // console.log('queryURL.set:', ...arguments);
         if (!Object.keys(query_obj).length) return console.error('query_obj:', query_obj)
         const url = new URL(url_string || location);
         Object.entries(query_obj).forEach(([key, value]) => url.searchParams.set(key, value));
         return url.toString();
      },

      remove(query = required(), url_string) {
         const url = new URL(url_string || location);
         url.searchParams.delete(query.toString());
         return url.toString();
      },
   },

   request: (() => {
      const API_STORE_NAME = 'YOUTUBE_API_KEYS'; // restrict access

      async function getKeys() { // restrict access
         NOVA.log('request.API: fetch to youtube_api_keys.json');
         // see https://gist.github.com/raingart/ff6711fafbc46e5646d4d251a79d1118/
         return await fetch('https://gist.githubusercontent.com/raingart/ff6711fafbc46e5646d4d251a79d1118/raw/youtube_api_keys.json')
            .then(res => res.text())
            // save
            .then(keys => {
               NOVA.log(`get and save keys in localStorage`, keys);
               localStorage.setItem(API_STORE_NAME, keys);
               return JSON.parse(keys);
            })
            // clear
            .catch(error => {
               localStorage.removeItem(API_STORE_NAME);
               throw error;
               // throw new Error(error);
            })
            .catch(reason => console.error('Error get keys:', reason)); // warn
      }

      return {
         /**
          * @param  {string} request
          * @param  {object} params
          * @param  {string*} api_key
          * @return {object}
         */
         async API({ request = required(), params = required(), api_key }) {
            // NOVA.log('request.API:', ...arguments); // err
            // console.debug('API:', ...arguments);
            // get API key
            const YOUTUBE_API_KEYS = localStorage.hasOwnProperty(API_STORE_NAME)
               ? JSON.parse(localStorage.getItem(API_STORE_NAME)) : await getKeys();

            if (!api_key && (!Array.isArray(YOUTUBE_API_KEYS) || !YOUTUBE_API_KEYS?.length)) {
               localStorage.hasOwnProperty(API_STORE_NAME) && localStorage.removeItem(API_STORE_NAME);
               // alert('I cannot access the API key.'
               //    + '\nThe plugins that depend on it have been terminated.'
               //    + "\n - Check your network's access to Github"
               //    + '\n - Generate a new private key'
               //    + '\n - Deactivate plugins that need it'
               // );
               // throw new Error('YOUTUBE_API_KEYS is empty:', YOUTUBE_API_KEYS);
               return console.error('YOUTUBE_API_KEYS empty:', YOUTUBE_API_KEYS);
            }

            const referRandKey = arr => api_key || 'AIzaSy' + arr[Math.floor(Math.random() * arr.length)];
            // combine GET
            const query = Object.keys(params)
               .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
               .join('&');

            const URL = `https://www.googleapis.com/youtube/v3/${request}?${query}&key=` + referRandKey(YOUTUBE_API_KEYS);
            // console.debug('URL', URL);
            // request
            return await fetch(URL)
               .then(response => response.json())
               .then(json => {
                  if (!json?.error && Object.keys(json).length) return json;
                  console.warn('used key:', NOVA.queryURL.get('key', URL));
                  if (json?.error && Object.keys(json.error).length) {
                     throw new Error(JSON.stringify(json?.error));
                  }
               })
               .catch(error => {
                  localStorage.removeItem(API_STORE_NAME);
                  console.error(`Request API failed:${URL}\n${error}`);
                  if (error?.message && (err = JSON.parse(error?.message))) {
                     return {
                        'code': err.code,
                        'reason': err.errors?.length && err.errors[0].reason,
                        'error': err.message,
                     };
                  }
                  // alert('Problems with the YouTube API:'
                  //    + '\n' + error?.message
                  //    + '\n\nIf this error is repeated:'
                  //    + '\n - Disconnect the plugins that need it'
                  //    + '\n - Update your YouTube API KEY');
               });
         },
      };

   })(),

   /**
    * @param  {string*} state
    * @return {string}
   */
   getPlayerState(state) {
      // movie_player.getPlayerState() === 2 // 2: PAUSED
      // NOVA.getPlayerState() == 'PLAYING'
      // movie_player.addEventListener('onStateChange', state => 'PLAYING' == NOVA.getPlayerState(state));
      return {
         '-1': 'UNSTARTED',
         0: 'ENDED',
         1: 'PLAYING',
         2: 'PAUSED',
         3: 'BUFFERING',
         5: 'CUED'
      }[state || movie_player.getPlayerState()];
   },

   // captureActiveVideoElement
   videoElement: (() => {
      const videoSelector = '#movie_player:not(.ad-showing) video';
      // init
      document.addEventListener('canplay', ({ target }) => {
         target.matches(videoSelector) && (NOVA.videoElement = target);
      }, { capture: true, once: true });
      // update
      document.addEventListener('play', ({ target }) => {
         target.matches(videoSelector) && (NOVA.videoElement = target);
      }, true);
      // movie_player.addEventListener('onVideoDataChange', () => console.debug('onVideoDataChange'));
      // document.dispatchEvent(new CustomEvent('nova-video-loaded'));
   })(),

   /**
    * @param  {}
    * @return {boolean}
   */
   isFullscreen: () => (
      /*document.fullscreen || */ // site page can be in full screen mode
      movie_player.classList.contains('ytp-fullscreen')
      || (movie_player.hasOwnProperty('isFullscreen') && movie_player.isFullscreen()) // Doesn't work in embed
   ),

   // videoId(url = document.URL) {
   //    return new URL(url).searchParams.get('v') || movie_player.getVideoData().video_id;
   // },

   /**
    * @param  {string*} api_key
    * @return {string}
   */
   async getChannelId(api_key) {
      const isChannelId = id => id && /UC([a-z0-9-_]{22})$/i.test(id);
      // local search
      let result = [
         // global
         document.querySelector('meta[itemprop="channelId"][content]')?.content,
         // channel page
         (document.body.querySelector('ytd-app')?.__data?.data?.response
            || document.body.querySelector('ytd-app')?.data?.response
            || window.ytInitialData
         )
            ?.metadata?.channelMetadataRenderer?.externalId,
         document.querySelector('link[itemprop="url"][href]')?.href.split('/')[4],
         location.pathname.split('/')[2],
         // playlist page
         document.body.querySelector('#video-owner a[href]')?.href.split('/')[4],
         document.body.querySelector('a.ytp-ce-channel-title[href]')?.href.split('/')[4],
         // watch page
         document.body.querySelector('ytd-watch-flexy')?.playerData?.videoDetails.channelId, // exclude embed page
         // document.body.querySelector('#owner #channel-name a[href]')?.href.split('/')[4], // outdated
         // ALL BELOW - not updated after page transition!
         // || window.ytplayer?.config?.args.ucid
         // || window.ytplayer?.config?.args.raw_player_response.videoDetails.channelId
         // || document.body.querySelector('ytd-player')?.player_.getCurrentVideoConfig()?.args.raw_player_response.videoDetails.channelId
         // embed page
      ]
         .find(i => isChannelId(i));
      // console.debug('channelId (local):', result);

      // if (!result) { // request
      //    let channelName;
      //    switch (this.currentPage) {
      //       case 'channel':
      //          if ((channelName_ = document.body.querySelector('#channel-handle')?.textContent)
      //             && channelName_.startsWith('@')
      //          ) {
      //             channelName = channelName_.substring(1);
      //          }

      //          break;
      //       // case 'watch':
      //       //    // channelLinkArr = await this.waitElement('#owner #channel-name a[href], ytm-slim-owner-renderer > a[href]');
      //       //    channelLinkArr = await this.waitElement('#owner #channel-name a[href]');
      //       //    channelArr = channelLinkArr?.href.split('/');
      //       //    if (channelArr.length && ['c', 'user'].includes(channelArr[3])) {
      //       //       channelName = channelArr[4];
      //       //    }
      //       //    break;
      //    }
      //    console.debug('channelName:', channelName);
      //    if (!channelName) return
      //    // https://www.googleapis.com/youtube/v3/channels?key={YOUR_API_KEY}&forUsername={USER_NAME}&part=id
      //    const res = await this.request.API({
      //       request: 'channels',
      //       params: { 'forUsername': channelName, 'part': 'id' },
      //       api_key: api_key,
      //    });
      //    // console.debug('res', res);
      //    if (res?.items?.length && isChannelId(res.items[0]?.id)) result = res.items[0].id;
      //    // console.debug('channelId (request):', result);
      // }
      return result;
   },

   // currently only compatible with the [save-channel-state] plugin. It makes sense to unify for subsequent decisions
   storage_obj_manager: {
      // STORAGE_NAME: 'str'
      async initName() {
         if (!this.STORAGE_NAME) {
            const
               CACHE_PREFIX = 'nova-channel-state:',
               channelId = await NOVA.getChannelId();

            this.STORAGE_NAME = CACHE_PREFIX + channelId;
         }
         return this.STORAGE_NAME;
      },
      // getName() {
      //    if (!this.STORAGE_NAME) {
      //       console.error('STORAGE_NAME:', this.STORAGE_NAME);
      //       throw new Error('STORAGE_NAME is empty');
      //    }
      //    return this.STORAGE_NAME;
      // },

      read() {
         return JSON.parse(localStorage.getItem(this.STORAGE_NAME));
      },

      write(obj_save) {
         localStorage.setItem(this.STORAGE_NAME, JSON.stringify(obj_save));
      },

      _getParam(key = required()) {
         if (storage = this.read()) {
            return storage[key];
         }
      },

      async getParam(key = required()) {
         await this.initName(); // wait storage name
         return this._getParam(...arguments);
      },

      save(obj_save) {
         // console.debug('STORAGE_OBJ_MANAGER save:', ...arguments);
         // update storage
         if (storage = this.read()) {
            obj_save = Object.assign(storage, obj_save);
         }
         // create storage
         this.write(obj_save);
      },

      remove(key) {
         // update if more ones
         if ((storage = this.read()) && Object.keys(storage).length > 1) {
            delete storage[key];
            this.write(storage);
         }
         // remove
         else localStorage.removeItem(this.STORAGE_NAME);
      }
   },

   // seachInObjectBy: {
   //    // ex:
   //    // NOVA.seachInObjectBy.key({
   //    //    'obj': window.ytplayer,
   //    //    'keys': 'ucid',
   //    //    'match_fn': val => {},
   //    // });
   //    // ex test array: NOVA.seachInObjectBy.key({ obj: { a: [1, {"ucid": 11}] }, keys: "ucid" })
   //    /**
   //     * @param  {object} obj
   //     * @param  {string} keys
   //     * @param  {function*} match_fn
   //     * @param  {boolean*} multiple
   //     * @return {object} {path: '.config.args.ucid', data: 'UCMDQxm7cUx3yXkfeHa5zJIQ'}
   //    */
   //    key({ obj = required(), keys = required(), match_fn, multiple = false, path = '' }) {
   //       // if (typeof obj !== 'object') {
   //       //    return console.error('seachInObjectBy > keys is not Object:', ...arguments);
   //       // }
   //       const setPath = d => (path ? path + '.' : '') + d;
   //       let hasKey, results = [];

   //       for (const prop in obj) {
   //          if (obj.hasOwnProperty(prop) && obj[prop]) {
   //             hasKey = keys.constructor.name === 'String' ? (keys === prop) : keys.indexOf(prop) > -1;

   //             if (hasKey && obj[prop].constructor.name !== 'Object' && (!match_fn || match_fn(obj[prop]))) {
   //                if (multiple) {
   //                   results.push({
   //                      'path': setPath(prop),
   //                      'data': obj[prop],
   //                   });
   //                }
   //                else {
   //                   return {
   //                      'path': setPath(prop),
   //                      'data': obj[prop],
   //                   };
   //                }
   //             }
   //             // in deeper (recursive)
   //             else {
   //                switch (obj[prop].constructor.name) {
   //                   case 'Object':
   //                      if (result = this.key({
   //                         'obj': obj[prop],
   //                         'keys': keys,
   //                         // 'path': path + '.' + prop,
   //                         'path': setPath(prop),
   //                         'match_fn': match_fn,
   //                      })) {
   //                         if (multiple) results.push(result);
   //                         else return result;
   //                      }
   //                      break;

   //                   case 'Array':
   //                      for (let i = 0; i < obj[prop].length; i++) {
   //                         if (result = this.key({
   //                            'obj': obj[prop][i],
   //                            'keys': keys,
   //                            'path': path + `[${i}]`,
   //                            'match_fn': match_fn,
   //                         })) {
   //                            if (multiple) results.push(result);
   //                            else return result;
   //                         }
   //                      }
   //                      break;

   //                   case 'Function':
   //                      if (Object.keys(obj[prop]).length) {
   //                         for (const j in obj[prop]) {
   //                            if (typeof obj[prop] !== 'undefined') {
   //                               // recursive
   //                               if (result = this.key({
   //                                  'obj': obj[prop][j],
   //                                  'keys': keys,
   //                                  'path': setPath(prop) + '.' + j,
   //                                  'match_fn': match_fn,
   //                               })) {
   //                                  if (multiple) results.push(result);
   //                                  else return result;
   //                               }
   //                            }
   //                         }
   //                      }
   //                      break;

   //                   // case 'String': break;
   //                   // case 'Number': break;
   //                   // case 'Boolean': break;
   //                   // case 'Function': break;

   //                   // default: break;
   //                }
   //             }
   //          }
   //       }

   //       if (multiple) return results;
   //    },
   // },

   log() {
      if (this.DEBUG && arguments.length) {
         console.groupCollapsed(...arguments);
         console.trace();
         console.groupEnd();
      }
   }
}
