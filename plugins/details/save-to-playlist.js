window.nova_plugins.push({
   id: 'save-to-playlist',
   title: 'Add sort/filter to "Save to playlist" menu',
   // 'title:zh': '',
   // 'title:ja': '',
   // 'title:ko': '',
   // 'title:id': '',
   // 'title:es': '',
   // 'title:pt': '',
   // 'title:fr': '',
   // 'title:it': '',
   // 'title:tr': '',
   // 'title:de': '',
   // 'title:pl': '',
   // 'title:ua': '',
   run_on_pages: 'watch, -mobile',
   section: 'details',
   // desc: '',
   _runtime: user_settings => {

      // alt - https://greasyfork.org/en/scripts/436123-youtube-save-to-playlist-filter

      NOVA.waitElement('tp-yt-paper-dialog #playlists')
         .then(playlists => {
            const container = playlists.closest('tp-yt-paper-dialog');

            new IntersectionObserver(([entry]) => {
               const searchInput = container.querySelector('input[type=search]')
               // in viewport
               if (entry.isIntersecting) {
                  if (user_settings.save_to_playlist_sort) sortPlaylistsMenu(playlists);

                  if (!searchInput) renderFilterInput(playlists);

               } else if (searchInput) { // (fix menu) reset state
                  searchInput.value = '';
                  searchInput.dispatchEvent(new Event('change')); // run searchFilter
               }
            })
               .observe(container);
         });

      function sortPlaylistsMenu(playlists = required()) {
         // alt - https://greasyfork.org/en/scripts/450181-youtube-save-to-playlist-menu-sorted-alphabetically

         // console.debug('sortPlaylistsMenu', ...arguments);
         if (!(playlists instanceof HTMLElement)) return console.error('playlists not HTMLElement:', playlists);

         playlists.append(...Array.from(playlists.childNodes).sort(sortByLabel));

         function sortByLabel(a, b) {
            const getLabel = (el = required()) => stringLocaleCompare(
               el.querySelector('#checkbox-label').textContent
            );
            return getLabel(a) > getLabel(b) ? 1 : -1;

            function stringLocaleCompare(a, b) {
               // for sorting string with emojis icons/emojis and keeping them on top
               return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            }
         }
      }

      function renderFilterInput(container = required()) {
         // console.debug('insertToHTML', ...arguments);
         if (!(container instanceof HTMLElement)) return console.error('container not HTMLElement:', container);

         const searchInput = document.createElement('input');
         searchInput.setAttribute('type', 'search');
         searchInput.setAttribute('placeholder', 'Playlist Filter');
         Object.assign(searchInput.style, {
            padding: '.4em .6em',
            border: 0,
            // 'border-radius': '4px',
            'margin-bottom': '1.5em',
         });

         ['change', 'keyup'].forEach(evt => {
            searchInput
               .addEventListener(evt, function () {
                  searchFilter({
                     'keyword': this.value,
                     'filter_selectors': 'ytd-playlist-add-to-option-renderer',
                     'highlight_selector': '#label'
                  });
               });
            searchInput
               .addEventListener('click', () => {
                  searchInput.value = '';
                  searchInput.dispatchEvent(new Event('change')); // run searchFilter
               });
         });

         container.prepend(searchInput);
      };

      function searchFilter({ keyword = required(), filter_selectors = required(), highlight_selector }) {
         // console.debug('searchFilter:', ...arguments);
         keyword = keyword.toString().toLowerCase();

         document.body.querySelectorAll(filter_selectors)
            .forEach(item => {
               const
                  text = item.textContent,
                  // text = item.querySelector(highlight_selector).getAttribute('title'),
                  hasText = text?.toLowerCase().includes(keyword),
                  highlight = el => {
                     // el.innerHTML = el.textContent.replace(/<\/?mark[^>]*>/g, ''); // clear highlight tags
                     item.style.display = hasText ? '' : 'none'; // hide el out of search
                     // if (hasText && keyword) {
                     //    highlightTerm({
                     //       'target': el,
                     //       'keyword': keyword,
                     //       // 'highlightClass':,
                     //    });
                     // }
                  };

               (highlight_selector ? item.querySelectorAll(highlight_selector) : [item])
                  .forEach(highlight);
            });

         // function highlightTerm({ target = required(), keyword = required(), highlightClass }) {
         //    // console.debug('highlightTerm:', ...arguments);
         //    const
         //       content = target.innerHTML,
         //       pattern = new RegExp('(>[^<.]*)?(' + keyword + ')([^<.]*)?', 'gi'),
         //       highlightStyle = highlightClass ? `class="${highlightClass}"` : 'style="background-color:#afafaf"',
         //       replaceWith = `$1<mark ${highlightStyle}>$2</mark>$3`,
         //       marked = content.replaceAll(pattern, replaceWith);

         //    return (target.innerHTML = marked) !== content;
         // }
      }

   },
   options: {
      save_to_playlist_sort: {
         _tagName: 'input',
         label: 'Default sorting alphabetically',
         'label:zh': '默认按字母顺序排序',
         'label:ja': 'デフォルトのアルファベット順のソート',
         'label:ko': '알파벳순 기본 정렬',
         'label:id': 'Penyortiran default menurut abjad',
         'label:es': 'Clasificación predeterminada alfabéticamente',
         'label:pt': 'Classificação padrão em ordem alfabética',
         'label:fr': 'Tri par défaut par ordre alphabétique',
         'label:it': 'Ordinamento predefinito in ordine alfabetico',
         'label:tr': 'Alfabetik olarak varsayılan sıralama',
         'label:de': 'Standardsortierung alphabetisch',
         'label:pl': 'Domyślne sortowanie alfabetyczne',
         'label:ua': 'Сортування за замовчуванням за алфавітом',
         type: 'checkbox',
         // title: '',
      },
   }
});
