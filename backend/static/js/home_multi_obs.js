var geopsg = geopsg || {};

geopsg.initHomeMulti = (options) => {
  const utils = geopsg.getSitesUtils();

  const map = L.map(document.getElementsByClassName('js-map-wrapper')[0], {
    attributionControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    keyboard: false,
    scrollWheelZoom: false,
    tap: false,
    zoomControl: false,
    zoomSnap: 0,
  });
  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
  tileLayer.addTo(map);

  const layers = options.sites.map((site) => L.marker(site.geom, { icon: utils.getMarkerIcon(site) }));
  options.observatories.forEach((observatory) => {
    if (observatory.geom) {
      layers.push(utils.getObservatoryLayer(observatory.geom, observatory.color));
    }
  });

  const group = L.featureGroup(layers);
  group.addTo(map);
  map.fitBounds(group.getBounds());
};
