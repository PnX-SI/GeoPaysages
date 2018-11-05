var oppv = oppv || {};
oppv.initMap = (options) => {
  let filters = {}
  for (const filterName in options.filters) {
    const filter = options.filters[filterName];
    filters[filterName] = Object.assign(filter, {
      items: filter.items.map(item => {
        return Object.assign(item, {
          isSelected: false
        })
      })
    })
  }

  new Vue({
    el: '#js-app-map',
    data: () => {
      return {
        isSidebarCollapsed: false,
        filters: filters
      }
    },
    mounted() {
      this.initMap()
    },
    methods: {
      initMap() {
        this.map = L.map(this.$refs.map, {
          zoomControl: false
        })
        this.tileLayer = L.tileLayer(
          'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
          }
        )
        L.control.zoom({
          position: 'topright'
        }).addTo(this.map);
        this.tileLayer.addTo(this.map)

        let lats = []
        let lons = []
        options.sites.forEach(site => {
          lats.push(site.latlon[0])
          lons.push(site.latlon[1])
          L.marker(site.latlon).addTo(this.map)
        });
        lats.sort()
        lons.sort()
        this.map.fitBounds([
          [lats[0], lons[0]],
          [lats[lats.length - 1], lons[lons.length - 1]]
        ])
      },
      onFilterClick() {
        let selected = []
        for (const filterName in options.filters) {
          const filter = options.filters[filterName]
          filter.items.forEach(item => {
            if (!item.isSelected)
              return
            options.sites.forEach(site => {
              if (selected.indexOf(site) > -1)
                return
              let prop = _.get(site, filterName)
              if (!Array.isArray(prop))
                prop = [prop]
              if (prop.indexOf(item.value) > -1)
                selected.push(site)
            })
          })
        }
        console.log(selected)
      }
    }
  })
}
