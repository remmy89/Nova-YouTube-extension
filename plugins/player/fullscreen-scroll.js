window.nova_plugins.push({
   id: 'player-disable-fullscreen-scroll',
   title: 'Disable player scrolling in fullscreen mode',
   'title:zh': '禁用全屏滚动',
   'title:ja': 'フルスクリーンスクロールを無効にする',
   'title:ko': '전체 화면 스크롤 비활성화',
   'title:es': 'Desactivar el desplazamiento a pantalla completa',
   'title:pt': 'Desabilitar rolagem em tela cheia',
   'title:fr': 'Désactiver le défilement plein écran',
   // 'title:tr': 'Tam ekran kaydırmayı devre dışı bırak',
   'title:de': 'Deaktivieren Sie das Scrollen im Vollbildmodus',
   run_on_pages: 'watch',
   section: 'player',
   // desc: '',
   _runtime: user_settings => {

      // hide button
      NOVA.css.push(`.ytp-fullerscreen-edu-button { display: none !important; }`);

      document.addEventListener('fullscreenchange', () => {
         document.fullscreenElement
            ? document.addEventListener('wheel', lockscroll, { passive: false })
            : document.removeEventListener('wheel', lockscroll)
      }
      );

      function lockscroll(evt) {
         // console.debug('fullscreenElement:', document.fullscreenElement);
         evt.preventDefault();
      }

      // document.addEventListener('wheel', evt => {
      //    if (document.fullscreen || movie_player.isFullscreen()) {
      //       // console.debug('fullscreenElement:', document.fullscreenElement);
      //       evt.preventDefault();
      //       // movie_player.scrollIntoView({behavior: 'instant', block: 'end', inline: 'nearest'});
      //    }
      // }, { passive: false });

   },
});
