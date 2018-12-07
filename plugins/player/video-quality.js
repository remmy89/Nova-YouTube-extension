_plugins.push({
   name: 'Video Quality',
   id: 'video-quality',
   section: 'player',
   depends_page: 'watch, embed',
   // sandbox: false,
   desc: 'Set prefered quality',
   // version: '0.1',
   _runtime: function (user_settings) {

      // page re-connect (fix to direct olugin)
      document.addEventListener('yt-navigate-start', function () {
         _set_quality(document.getElementById('movie_player'));
      });

      // page load
      PolymerYoutube.waitFor('#movie_player', function (playerId) {
         _set_quality(playerId);
      });

      function _set_quality(playerId) {
         const target_quality = user_settings['video_quality'];
         // const target_quality = 'small'; //test

         let wait_quality = setInterval(() => {
            // console.log('wait_quality');
            if (playerId.getAvailableQualityLevels().length) {
               clearInterval(wait_quality);

               const qualities = playerId.getAvailableQualityLevels();

               if (playerId.getPlaybackQuality() == target_quality) return;

               let max_available_quality = Math.max(qualities.indexOf(target_quality), 0);
               qualityToSet = qualities[max_available_quality];

               playerId.setPlaybackQuality(qualityToSet);
               playerId.setPlaybackQualityRange(qualityToSet, qualityToSet);

               // console.log('Available qualities:', JSON.stringify(qualities));
               // console.log("try set quality:", qualityToSet);
               // console.log('set realy quality:', playerId.getPlaybackQuality());
            }
         }, 50);
      }
   },
   export_opt: (function (data) {
      return {
         'video_quality': {
            _elementType: 'select',
            label: 'Quality',
            title: 'If unavailable, set max available quality',
            options: [
               // Available 'highres','hd2880','hd2160','hd1440','hd1080','hd720','large','medium','small','tiny'
               /* beautify preserve:start */
               { label: '4320p (8k/FUHD)', value: 'highres' },
               { label: '2880p (5k/UHD)', value: 'hd2880' },
               { label: '2160p (4k/QFHD)', value: 'hd2160' },
               { label: '1440p (QHD)', value: 'hd1440' },
               { label: '1080p (FHD)', value: 'hd1080' },
               { label: '720p (HD)', value: 'hd720', selected: true },
               { label: '480p (SD)', value: 'large' },
               { label: '360p', value: 'medium' },
               { label: '240p', value: 'small' },
               { label: '144p', value: 'tiny' },
               // { label: 'Auto', value: 'auto' },
               /* beautify preserve:end */
            ]
         },
      };
   }()),
});