var oppv = oppv || {};
oppv.initMap = (options) => {
  options.filters.forEach(filter => {
    filter.items.forEach(item => {
      Object.assign(item, {
        isSelected: false
      })
    })
  })
  const filters = _.cloneDeep(options.filters)
  let map;
  let markers = []

  new Vue({
    el: '#js-app-map',
    data: () => {
      return {
        isSidebarCollapsed: false,
        filters: filters,
        sites: options.sites
      }
    },
    mounted() {
      this.initMap()
    },
    methods: {
      initMap() {
        map = L.map(this.$refs.map, {
          zoomControl: false
        })
        const tileLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }
        )
        L.control.zoom({
          position: 'topright'
        }).addTo(map);
        tileLayer.addTo(map)
        this.setFilters()
      },
      onFilterClick(filter, item) {
        //this.updateFilters()
        this.setFilters()
      },
      updateFilters() {
        const filterThemes = filters.find(filter => {
          return filter.name == 'themes'
        })
        let selectedThemes = filterThemes.items.filter(item => {
          return item.isSelected
        })
        if (!selectedThemes.length)
          selectedThemes = filterThemes.items

        const selectedSubthemes = options.filters.find(filter => {
          return filter.name == 'subthemes'
        }).items.filter(item => {
          return _.intersectionWith(item.themes, selectedThemes, function (a, b) {
            return a == b.id
          }).length
        })

        filters.find(filter => {
          return filter.name == 'subthemes'
        }).items = selectedSubthemes
      },
      setFilters() {
        let selectedFilters = filters.map(filter => {
          let selectedItems = filter.items.filter(item => {
            return item.isSelected
          })
          let items = selectedItems.length ? selectedItems : filter.items
          return Object.assign({}, filter, {
            ids: items.map(item => {
              return item.id
            })
          })
        })

        let selectedSites = []
        options.sites.forEach(site => {
          unmatchedProp = selectedFilters.find(filter => {
            let prop = _.get(site, filter.name)
            if (!Array.isArray(prop))
              prop = [prop]
            return !_.intersection(prop, filter.ids).length
          })
          if (!unmatchedProp)
            selectedSites.push(site)
        })

        markers.forEach(marker => {
          map.removeLayer(marker)
        })
        markers = []

        const lats = []
        const lons = []
        selectedSites.forEach(site => {
          lats.push(site.latlon[0])
          lons.push(site.latlon[1])
          let marker = L.marker(site.latlon)
          marker.bindPopup('<div class="img" style="background-image: url(' + site.photos[site.photos.length - 1].url + ');"></div><div class="title">' + site.name_site + '</div>', {
            closeButton: false
          })
          marker.on('mouseover', (e) => {
            marker.openPopup()
          })
          marker.on('mouseout', (e) => {
            marker.closePopup()
          })
          marker.on('click', (e) => {
            window.location.href = site.link.replace('http://127.0.0.1:8000', '')
          })
          marker.addTo(map)
          markers.push(marker)
        });
        if (!markers.length)
          return
        lats.sort()
        lons.sort()
        map.fitBounds([
          [lats[0], lons[0]],
          [lats[lats.length - 1], lons[lons.length - 1]]
        ], {
          maxZoom: 11
        })
      }
    }
  })
}
