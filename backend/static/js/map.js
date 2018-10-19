var oppv = oppv || {};
oppv.map = (options) => {
  options.communes = options.communes.map(commune => {
    return Object.assign(commune, {
      isPressed: false
    })
  })
  new Vue({
    el: '#js-app-map',
    data: () => {
      return {
        isSidebarCollapsed: false,
        communes: options.communes
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
          L.marker(site.latlon).addTo(this.map);
        });
        lats.sort()
        lons.sort()
        this.map.fitBounds([[lats[0], lons[0]], [lats[lats.length-1], lons[lons.length-1]]]);
      }
    }
  })
}
