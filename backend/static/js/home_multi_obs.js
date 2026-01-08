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

  let confLayers = _.get(options.dbconf, 'home_map_layers', _.get(options.dbconf, 'map_layers', []));
  if (!Array.isArray(confLayers)) {
    confLayers = [];
  }
  if (!confLayers.length) {
    confLayers = [
      {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      },
    ];
  }

  confLayers.forEach((confLayer) => {
    const fct = confLayer.isWMS ? L.tileLayer.wms : L.tileLayer;
    fct(confLayer.url, confLayer.options).addTo(map);
  });

  const layers = options.sites.map((site) => L.marker(site.geom, { icon: utils.getMarkerIcon(site) }));
  options.observatories.forEach((observatory) => {
    if (observatory.geom) {
      const layer = utils.getObservatoryLayer(observatory.geom, observatory.color);
      layers.push(layer);
    }
  });
  const group = L.featureGroup(layers);
  group.addTo(map);
  map.fitBounds(group.getBounds(), { paddingTopLeft: [40, 50], paddingBottomRight: [40, 30] });
};
