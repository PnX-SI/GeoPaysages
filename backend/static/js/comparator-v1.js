var geopsg = geopsg || {};
geopsg.comparator = (options) => {
  Vue.component('app-comparator-v1', {
    template: '#tpl-app-comparator-v1',
    data: () => {
      return {
        pinned: -1,
        nextComparedIndex: 0,
        comparedPhotoIndexes: [0, 1],
        comparedPhotos: [options.photos[0], options.photos[1]],
        zoomPhotos: []
      }
    },
    mounted() {
      this.initSwiperThumbs()
    },
    methods: {
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
        if (this.pinned > -1) {
          comparedIndex = this.getUnpinned()
          this.$set(this.comparedPhotos, comparedIndex, Object.assign({}, photo))
        } else {
          /* //increment nextComparedIndex and back to 0 if > comparedPhotos.length
          this.nextComparedIndex = ++this.nextComparedIndex % this.comparedPhotos.length */
          this.comparedPhotoIndexes.push(i)
          this.comparedPhotoIndexes.shift()

          let comparedPhotos = this.comparedPhotoIndexes.map(index => {
            let photo = options.photos[index]
            return Object.assign({}, photo)
          })

          comparedPhotos.sort((a, b) => {
            return a.date < b.date ? -1 : 1
          })

          this.comparedPhotos = comparedPhotos.map(comparedPhoto => {
            const oldComparedPhoto = this.comparedPhotos.find(oldComparedPhoto => {
              return oldComparedPhoto.date == comparedPhoto.date
            })
            comparedPhoto.comparedLoaded = Boolean(oldComparedPhoto)
            return comparedPhoto;
          })
        }
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
      },
      onDownloadClick(photo) {
        window.saveAs(photo.dl, photo.dl.split('/').pop());
      }
    }
  })
}
