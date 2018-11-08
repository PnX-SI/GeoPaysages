var  oppv = oppv || {};
oppv.comparator = (options) => {
  new Vue({
    el: '#js-app-comparator',
    data: () => {
      return {
        comparedPhotoIndexes: [0, 1],
        comparedPhotos: [options.site.photos[0], options.site.photos[1]],
        zoomPhotos: []
      }
    },
    methods: {
      isCompared(i) {
        return this.comparedPhotoIndexes.indexOf(i) > -1
      },
      onThumbClick(i) {
        if (this.comparedPhotoIndexes.indexOf(i) > -1)
          return;
        this.comparedPhotoIndexes.push(i)
        this.comparedPhotoIndexes.shift()

        let comparedPhotos = this.comparedPhotoIndexes.map(index => {
          let photo = options.site.photos[index]
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
