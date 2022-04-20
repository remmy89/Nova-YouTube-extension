window.nova_plugins.push({
   id: 'premiere-hide',
   title: 'Hide Premieres',
   // 'title:zh': '',
   // 'title:ja': '',
   // 'title:ko': '',
   // 'title:es': '',
   // 'title:pt': '',
   // 'title:fr': '',
   // 'title:tr': '',
   // 'title:de': '',
   run_on_pages: 'home, results, feed, channel',
   section: 'other',
   // desc: '',
   _runtime: user_settings => {

      // init
      hideHTML();
      // page scroll update
      document.addEventListener('yt-action', evt => {
         if (['ytd-update-grid-state-action', 'yt-append-continuation-items-action'].includes(evt.detail?.actionName)) {
            hideHTML();
         }
      });

      function hideHTML() {
         document.body.querySelectorAll('ytd-thumbnail-overlay-time-status-renderer[overlay-style="UPCOMING"], #overlays [aria-label="PREMIERE"]') // #metadata-line:has_text("Premieres")
            .forEach(el => el.closest('ytd-grid-video-renderer')?.remove());
         // for test
         // .forEach(el => {
         //    if (thumb = el.closest('ytd-grid-video-renderer')) {
         //       // thumb.style.display = 'none';
         //       console.debug('has Premieres:', thumb);
         //       thumb.style.border = '2px solid red'; // mark for test
         //    }
         // });
      }

   },
});