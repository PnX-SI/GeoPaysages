var oppv = oppv || {};
oppv.comparator = (options) => {
  new Vue({
    el: '#js-app-comparator',
    data: () => {
      return {
        pinned: -1,
        nextComparedIndex: 0,
        comparedPhotos: [options.photos[0], options.photos[1]],
        zoomPhotos: [],
        textCollapses: ['description', 'testimonial'],
        textCollapsables: [],
        textCollapseds: []
      }
    },
    mounted() {
      this.initTextCollapses()
      this.initSwiperThumbs()
      this.initMap()
    },
    computed: {
      textCollapseClsDescription() {
        return {
          'text-collapsable': this.textCollapsables.indexOf('description') > -1,
          'text-collapsed': this.textCollapseds.indexOf('description') > -1
        }
      },
      textCollapseClsTestimonial() {
        return {
          'text-collapsable': this.textCollapsables.indexOf('testimonial') > -1,
          'text-collapsed': this.textCollapseds.indexOf('testimonial') > -1
        }
      }
    },
    methods: {
      initTextCollapses() {
        this.textCollapseds = this.textCollapses.slice()
        let setCollapsables = () => {
          let collapseds = this.textCollapseds.slice();
          this.textCollapsables = this.textCollapses.slice()
          this.textCollapseds = this.textCollapses.slice()
          this.$nextTick(() => {
            this.textCollapsables = []
            this.textCollapses.forEach(name => {
              let el = this.$refs['text_collapse_' + name]
              let target = el.getElementsByClassName('target')[0]
              if (target.scrollHeight > target.clientHeight)
              this.textCollapsables.push(name)
            })
            this.textCollapseds = collapseds
          })
        }
        window.addEventListener('resize', () => {
          setCollapsables()
        })
        setCollapsables()
      },
      toggleTextCollapse(name) {
        let i = this.textCollapseds.indexOf(name)
        if (i > -1)
          this.textCollapseds.splice(i, 1)
        else
          this.textCollapseds.push(name)
      },
      initSwiperThumbs() {
        let swiper = new Swiper(this.$refs.swiperThumbs, {
          slidesPerView: 'auto',
          spaceBetween: 16,
          freeMode: true,
          navigation: {
            nextEl: this.$refs.swiperThumbsNext,
            prevEl: this.$refs.swiperThumbsPrev
          }
        });
        window.addEventListener('resize', () => {
          swiper.update();
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