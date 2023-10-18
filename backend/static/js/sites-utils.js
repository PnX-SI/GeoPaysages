var geopsg = geopsg || {};
geopsg.getSitesUtils = () => {
  return {
    getMarkerIcon(site, options) {
      return L.divIcon({
        html: `
      <svg style="color: ${site.observatory.color}" width="40" height="40" viewBox="00 0 511.974 511.974">
        <path fill="currentColor" d="M255.987,0C161.882,0,85.321,76.553,85.321,170.641c0,45.901,14.003,73.924,33.391,112.708
        c3.012,6.025,6.17,12.331,9.438,19.038c47.753,98.065,120.055,204.792,120.781,205.858c1.587,2.33,4.233,3.729,7.057,3.729
        s5.47-1.399,7.057-3.729c0.725-1.067,73.028-107.793,120.781-205.858c3.268-6.707,6.426-13.013,9.438-19.038
        c19.388-38.784,33.391-66.807,33.391-112.708C426.654,76.553,350.093,0,255.987,0z M332.19,180.233
        "/>
      </svg><div class="icon">${!_.get(options, 'showThemeIcon', true) ? '' : _.get(site, 'main_theme.icon', '')}</div>`,
        className: 'marker-site',
        iconSize: [40, 40],
        iconAnchor: [18, 40],
        popupAnchor: [0, -40],
      });
    },
    getObservatoryLayer(geom, color) {
      return L.geoJson(wellknown.parse(geom), {
        style: {
          opacity: 0,
          fillColor: color,
          fillOpacity: 0.3,
        },
      });
    },
  };
};
