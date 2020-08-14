var geopsg = geopsg || {};
geopsg.comparator = (options) => {
  const maps = [];
  const modes = [{
    name: 'sidebyside',
    label: "Superposition"
  }, {
    name: 'split',
    label: "Côte à côte"
  }];
  let sbsCtrl;

  //TODO use format as an argument
  Vue.filter('dateFormat', (value) => {
    return value.toLocaleString('fr-FR', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  });

  Vue.component('app-comparator-v2', {
    template: '#tpl-app-comparator-v2',
    data: () => {
      return {
        curMode: modes[0],
        modes: modes,
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

        // Init L.control.sideBySide
        maps[0].createPane('left');
        maps[0].createPane('right');

        this.updateLayers();
      },
      initMap(num) {
        const map = L.map(this.$refs['photo' + num], {
          zoomControl: false,
          crs: L.CRS.Simple,
          center: [0, 0],
          zoom: 0,
          zoomSnap: 0.25,
          minZoom: -5,
          gestureHandling: true
        });
        map.attributionControl.setPrefix('');

        return map;
      },
      onBtnModeClick(selectedMode) {
        this.curMode = selectedMode;
        this.updateLayers();
      },
      onPhotoSelected(index, photo) {
        this.$set(this.comparedPhotos, index, photo);
        this.updateLayers();
      },
      updateLayers() {
        this.$bvModal.show('comparatorLoading');
        this.clearMaps();
        if (sbsCtrl) {
          maps[0].removeControl(sbsCtrl);
          sbsCtrl = null;
        }

        Promise.all([
          this.loadImg(this.comparedPhotos[0].filename),
          this.loadImg(this.comparedPhotos[1].filename)
        ])
          .then(imgs => {
            const layers = [];
            imgs.forEach((img, i) => {
              const imgW = img.width;
              const imgH = img.height;
              layers.push(
                L.imageOverlay(img.src, [[-imgH / 2, -imgW / 2], [imgH / 2, imgW / 2]])
              );
            });

            if (this.curMode.name == 'split') {
              layers[0].addTo(maps[0]);
              layers[1].addTo(maps[1]);
            } else if (this.curMode.name == 'sidebyside') {
              layers[0].options.pane = 'left';
              layers[1].options.pane = 'right';
              layers[0].addTo(maps[0]);
              layers[1].addTo(maps[0]);
              sbsCtrl = L.control.sideBySide(layers[0], layers[1]).addTo(maps[0]);
            }
            this.resizeMaps();
            maps[0].fitBounds(maps[0].getBounds());
            this.$bvModal.hide('comparatorLoading');
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
      resizeMaps() {
        maps.forEach(map => {
          map.eachLayer((layer) => {
            map.invalidateSize();
          });
        });
      }
    }
  });

  Vue.component('app-comparator-v2-selector', {
    template: '#tpl-app-comparator-v2-selector',
    props: ['items', 'selectedItem', 'right'],
    data: () => {
      return {
        dateFrom: null,
        dateTo: null,
        currentPage: 1,
        perPage: 3,
        pageItems: [],
        nbFilteredItems: 0
      }
    },
    beforeMount() {
      this.setFilteredItems();
      this.setPageItems();
    },
    watch: {
      dateFrom(val) {
        this.setFilteredItems();
        this.currentPage = 1;
        this.setPageItems();
      },
      dateTo(val) {
        this.setFilteredItems();
        this.currentPage = 1;
        this.setPageItems();
      },
      currentPage(val) {
        this.setPageItems();
      }
    },
    methods: {
      onItemSelected(item) {
        this.$emit('item-click', item);
      },
      formatItem(item) {
        if (!item) {
          return;
        }
        if (!(item.shot_on instanceof Date)) {
          item.shot_on = new Date(item.shot_on);
        }
      },
      setPageItems() {
        const pageIndex = this.currentPage - 1;
        const startIndex = pageIndex * this.perPage;
        this.pageItems = this.filteredItems.slice(startIndex, startIndex + this.perPage)
          .map(item => {
            this.formatItem(item);
            return item;
          });
      },
      setFilteredItems() {
        const dateFrom = !this.dateFrom ? null : new Date(this.dateFrom);
        const dateTo = !this.dateTo ? null : new Date(this.dateTo);
        if (!dateFrom && !dateTo) {
          this.filteredItems = [...this.items];
          this.nbFilteredItems = this.filteredItems.length;
          return;
        }
        const searchDateFromIndex = (startIndex, endIndex) => {
          if (endIndex < startIndex) {
            return -1;
          }
          const middleIndex = Math.floor((startIndex + endIndex) / 2);
          const item = this.items[middleIndex];
          this.formatItem(item);
          const itemBefore = this.items[middleIndex - 1];
          this.formatItem(itemBefore);
          if (item.shot_on >= dateFrom && (!itemBefore || itemBefore.shot_on < dateFrom)) {
            return middleIndex;
          } else if (item.shot_on < dateFrom && endIndex > 0) {
            return searchDateFromIndex(middleIndex + 1, endIndex);
          } else if (endIndex > 0) {
            return searchDateFromIndex(0, middleIndex);
          }
          return -1;
        };
        const searchDateToIndex = (startIndex, endIndex) => {
          if (endIndex < startIndex) {
            return -1;
          }
          const middleIndex = Math.floor((startIndex + endIndex) / 2);
          const item = this.items[middleIndex];
          this.formatItem(item);
          const itemAfter = this.items[middleIndex + 1];
          this.formatItem(itemAfter);
          if (item.shot_on <= dateTo && (!itemAfter || itemAfter.shot_on > dateTo)) {
            return middleIndex;
          } else if (item.shot_on > dateTo && endIndex > 0) {
            return searchDateToIndex(0, middleIndex - 1);
          } else if (endIndex > 0) {
            return searchDateToIndex(middleIndex + 1, endIndex);
          }
          return -1;
        };
        let startIndex = 0;
        let endIndex = this.items.length - 1;
        if (dateFrom) {
          startIndex = searchDateFromIndex(0, endIndex);
          if (startIndex < 0) {
            this.filteredItems = [];
            this.nbFilteredItems = 0;
            return;
          }
        }
        if (dateTo) {
          endIndex = searchDateToIndex(startIndex, endIndex);
          if (endIndex < 0) {
            this.filteredItems = [];
            this.nbFilteredItems = 0;
            return;
          }
        }

        this.filteredItems = this.items.slice(startIndex, endIndex + 1).map(item => {
          this.formatItem(item);
          return item;
        });
        this.nbFilteredItems = this.filteredItems.length;
      }
    }
  });
}
