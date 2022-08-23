var geopsg = geopsg || {};

geopsg.initHomeMulti = (options) => {
  const getMarkerIcon = (site) => {
    return L.divIcon({
      html: `
    <svg style="color: ${site.observatory.color}" width="40" height="40" viewBox="00 0 511.974 511.974">
      <path fill="currentColor" d="M255.987,0C161.882,0,85.321,76.553,85.321,170.641c0,45.901,14.003,73.924,33.391,112.708
			c3.012,6.025,6.17,12.331,9.438,19.038c47.753,98.065,120.055,204.792,120.781,205.858c1.587,2.33,4.233,3.729,7.057,3.729
			s5.47-1.399,7.057-3.729c0.725-1.067,73.028-107.793,120.781-205.858c3.268-6.707,6.426-13.013,9.438-19.038
			c19.388-38.784,33.391-66.807,33.391-112.708C426.654,76.553,350.093,0,255.987,0z M332.19,180.233
			"/>
    </svg><div class="icon">${_.get(site, 'main_theme.icon', '')}</div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [18, 40],
      popupAnchor: [0, -40],
    });
  };

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

  const layers = options.sites.map((site) => L.marker(site.geom, { icon: getMarkerIcon(site) }));
  options.observatories.forEach((observatory) => {
    if (observatory.geom) {
      layers.push(
        L.geoJson(wellknown.parse(observatory.geom), {
          style: {
            opacity: 0,
            fillColor: observatory.color,
            fillOpacity: 0.3,
          },
        }),
      );
    }
  });

  const group = L.featureGroup(layers);
  group.addTo(map);
  map.fitBounds(group.getBounds());
};
