var geopsg = geopsg || {};
geopsg.comparator = (options) => {
  let photoMap1;
  let photoMap2;
  const maps = [];
  new Vue({
    el: '#js-app-comparator',
    data: () => {
      return {
        photos: options.photos,
        comparedPhotos: [
          options.photos[0],
          options.photos[options.photos.length - 1]
        ]
      }
    },
    mounted() {
      this.initMaps();
    },
    methods: {
      initMaps() {
        maps.push(this.initMap(1));
        maps.push(this.initMap(2));

        maps[0].sync(maps[1]);
        maps[1].sync(maps[0]);

        this.updateLayers();
      },
      initMap(num) {
        const map = L.map(this.$refs['photo' + num], {
          zoomControl: false,
          crs: L.CRS.Simple,
          center: [0, 0],
          zoom: 0,
          zoomSnap: 0.25,
          minZoom: -5
        });
        map.attributionControl.setPrefix('');

        return map;
      },
      updateLayers() {
        this.clearMaps();

        Promise.all([
          this.loadImg(this.comparedPhotos[0].filename),
          this.loadImg(this.comparedPhotos[1].filename)
        ])
          .then(imgs => {
            maps.forEach((map, i) => {
              const img = imgs[i];
              const imgW = img.width;
              const imgH = img.height;
              L.imageOverlay(img.src, [[-imgH / 2, -imgW / 2], [imgH / 2, imgW / 2]]).addTo(map);
            });
          });
      },
      loadImg(filename) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = function() {
            resolve(this);
          };
          img.src = '/static/data/images/' + filename;
        });
      },
      clearMaps() {
        maps.forEach(map => {
          map.eachLayer((layer) => {
            map.removeLayer(layer);
          });
        });
      },
      onPhotoSelected(index, photo) {
        this.$set(this.comparedPhotos, index, photo);
        //this.comparedPhotos[index] = photo;
        this.updateLayers();
      }
    }
  })
}
