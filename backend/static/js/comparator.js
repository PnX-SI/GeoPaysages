initComparator = (options) => {
  let nextSelectedIndex = 0;
  new Vue({
    el: '#js-app-comparator',
    data: () => {
      return {
        selectedPhotos: [options.site.photos[0], options.site.photos[1]],
        zoomPhotos: []
      }
    },
    methods: {
      onThumbClick(i) {
        this.$set(this.selectedPhotos, nextSelectedIndex, Object.assign({
          comparedLoaded: false
        }, options.site.photos[i]))
        nextSelectedIndex = ++nextSelectedIndex % 2
      },
      onComparedLoaded(i) {
        this.$set(this.selectedPhotos, i, Object.assign(this.selectedPhotos[i], {
          comparedLoaded: true
        }))
      },
      onZoomClick(i) {
        if (i === undefined)
          this.zoomPhotos = this.selectedPhotos
        else
          this.zoomPhotos = [this.selectedPhotos[i]]
      }
    }
  })
}
