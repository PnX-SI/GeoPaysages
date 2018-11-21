var oppv = oppv || {};
oppv.comparator = (options) => {
  new Vue({
    el: '#js-app-comparator',
    data: () => {
      return {
        pinned: -1,
        nextComparedIndex: 0,
        comparedPhotos: [options.photos[0], options.photos[1]],
        zoomPhotos: []
      }
    },
    mounted() {
      this.initSwiperThumbs()
      this.initMap()
    },
    methods: {
      initSwiperThumbs() {
        new Swiper('.swiper-container', {
          slidesPerView: 'auto',
          centeredSlides: true,
          spaceBetween: 30,
          freeMode: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
        });
      },
      initMap() {
        map = L.map(this.$refs.map, {
          center: options.site.geom,
          zoom: 8
        })
        const tileLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }
        )
        tileLayer.addTo(map)
        L.marker(options.site.geom).addTo(map)
      },
      isPinned(i) {
        return this.pinned == i
      },
      onPinClick(i) {
        if (!this.isPinned(i))
          this.pinned = i
        else {
          this.nextComparedIndex = this.pinned
          this.pinned = -1
        }
      },
      getUnpinned(i) {
        return (this.pinned + 1) % 2
      },
      isCompared(i) {
        const photo = options.photos[i]
        return this.comparedPhotos.find(comparedPhoto => {
          return comparedPhoto.id == photo.id
        })
      },
      onThumbClick(i) {
        if (this.isCompared(i))
          return
        
        const photo = options.photos[i]
        let comparedIndex = this.nextComparedIndex
        if (this.pinned > -1)
          comparedIndex = this.getUnpinned()
        else //increment nextComparedIndex and back to 0 if > comparedPhotos.length
          this.nextComparedIndex = ++this.nextComparedIndex % this.comparedPhotos.length

        this.$set(this.comparedPhotos, comparedIndex, Object.assign({}, photo))
      },
      onComparedLoaded(i) {
        this.$set(this.comparedPhotos, i, Object.assign(this.comparedPhotos[i], {
          comparedLoaded: true
        }))
      },
      onZoomClick(i) {
        if (i === undefined)
          this.zoomPhotos = this.comparedPhotos
        else
          this.zoomPhotos = [this.comparedPhotos[i]]
      }
    }
  })
}
