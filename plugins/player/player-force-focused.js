_plugins.push({
   name: 'Force player focused',
   id: 'player-focused-onkeydown',
   section: 'player',
   depends_page: 'watch',
   // sandbox: false,
   desc: 'HotKeys player priority (SPACE/F etc.)',
   _runtime: function (user_settings) {
      
      // document.addEventListener('focus', captureFocus);
      document.addEventListener('keydown', captureFocus);

      function captureFocus(event) {
         // console.log('captureFocus', document.activeElement);

         if (document.activeElement.tagName.toLowerCase() !== "input" &&
            document.activeElement.slot.toLowerCase() !== "input"
            // && !window.getSelection()
         ) {
            // document.activeElement.style.border = "2px solid red";
            document.querySelector("video").focus();
            // console.log('focused');
         }
      }

   },
});
