var geopsg = geopsg || {};
geopsg.initHome = (options) => {

  const map = L.map(document.getElementsByClassName('js-map-wrapper')[0], {
    attributionControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    keyboard: false,
    scrollWheelZoom: false,
    tap: false,
    zoomControl: false
  })
  const tileLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
  )
  tileLayer.addTo(map)

  const lats = []
  const lons = []
  options.sites.forEach(site => {
    lats.push(site.geom[0])
    lons.push(site.geom[1])
    L.marker(site.geom).addTo(map)
    lats.sort()
    lons.sort()
    map.fitBounds([
      [lats[0], lons[0]],
      [lats[lats.length - 1], lons[lons.length - 1]]
    ])
  })

}