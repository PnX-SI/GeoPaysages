var geopsg = geopsg || {};
geopsg.initSites = (options) => {
  let selectedFilters = [];
  const url = new URL(window.location);
  try {
    selectedFilters = JSON.parse(url.searchParams.get('filters'));
    if (!selectedFilters || !selectedFilters.length) {
      selectedFilters = JSON.parse(localStorage.getItem('geopsg.sites.selectedFilters'));
    } else {
      selectedFilters = selectedFilters.map((filter) => {
        return {
          name: filter.name,
          items: filter.values.map((value) => {
            return {
              id: value,
            };
          }),
        };
      });
    }
  } catch (error1) {
    try {
      selectedFilters = JSON.parse(localStorage.getItem('geopsg.sites.selectedFilters'));
    } catch (error2) {}
  }

  url.searchParams.delete('filters');
  window.history.replaceState({}, '', url);

  if (!Array.isArray(selectedFilters)) {
    selectedFilters = [];
  }
  options.filters.forEach((filter) => {
    filter.selectedItems = [];
    filter.items.forEach((item) => {
      const isSelected = Boolean(
        selectedFilters.find((selectedFilter) => {
          return (
            selectedFilter.name == filter.name &&
            selectedFilter.items.find((selectedItem) => {
              return selectedItem.id == item.id;
            })
          );
        }),
      );
      Object.assign(item, {
        nbSites: 0,
        isSelected: isSelected,
      });
      if (isSelected) {
        filter.selectedItems.push(item);
      }
    });
    filter.isOpen = Boolean(filter.selectedItems.length);
  });
  const filters = _.cloneDeep(options.filters);
  let map;
  let markers = [];
  let mapBounds;

  const observatories = options.observatories;

  const getMarkerIcon = (site) => {
    return L.divIcon({
      html: `
    <svg style="color: ${site.observatory.color}" width="40" height="40" viewBox="00 0 511.974 511.974">
      <path fill="currentColor" d="M255.987,0C161.882,0,85.321,76.553,85.321,170.641c0,45.901,14.003,73.924,33.391,112.708
			c3.012,6.025,6.17,12.331,9.438,19.038c47.753,98.065,120.055,204.792,120.781,205.858c1.587,2.33,4.233,3.729,7.057,3.729
			s5.47-1.399,7.057-3.729c0.725-1.067,73.028-107.793,120.781-205.858c3.268-6.707,6.426-13.013,9.438-19.038
			c19.388-38.784,33.391-66.807,33.391-112.708C426.654,76.553,350.093,0,255.987,0z M332.19,180.233
			"/>
    </svg>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [18, 40],
      popupAnchor: [0, -40],
    });
  };

  Vue.component('v-multiselect', window.VueMultiselect.default);

  new Vue({
    el: '#js-app-sites',
    data: () => {
      return {
        isSidebarCollapsed: false,
        filters: filters,
        sites: options.sites,
        selectedSites: [],
        filterLimitText: (count) => {
          return `+ ${count}`;
        },
        shareUrl: '',
      };
    },
    mounted() {
      this.initMap();
    },
    methods: {
      initMap() {
        let layersConf = _.get(options.dbconf, 'map_layers', []);
        if (!Array.isArray(layersConf)) {
          layersConf = [];
        }
        if (!layersConf.length) {
          layersConf.push({
            label: 'OSM classic',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            options: {
              maxZoom: 18,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
          });
        }
        let mapLayers = layersConf.map((layer) => {
          return {
            label: layer.label,
            layer: L.tileLayer(layer.url, layer.options),
          };
        });

        map = L.map(this.$refs.map, {
          zoomControl: false,
          layers: [mapLayers[0].layer],
        });

        L.control
          .scale({
            position: 'bottomright',
            imperial: false,
          })
          .addTo(map);

        L.control
          .zoom({
            position: 'topright',
          })
          .addTo(map);

        L.easyButton({
          position: 'topright',
          states: [
            {
              stateName: 'reset',
              onClick: function (button, map) {
                if (mapBounds) {
                  map.fitBounds(mapBounds.bbox, mapBounds.options);
                }
              },
              icon: 'icon ion-md-locate',
            },
          ],
        }).addTo(map);

        observatories.forEach((observatory) => {
          L.geoJson(wellknown.parse(observatory.data.geom), {
            style: {
              opacity: 0,
              fillColor: observatory.data.color,
              fillOpacity: 0.3,
            },
          }).addTo(map);
          observatory.markers = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
              return new L.DivIcon({
                html: `<div style="background:${
                  observatory.data.color
                };"><span>${cluster.getChildCount()}</span></div>`,
                className: 'marker-cluster',
                iconSize: new L.Point(40, 40),
              });
            },
          });
          map.addLayer(observatory.markers);
        });

        map.addControl(
          new L.Control.Fullscreen({
            position: 'topright',
          }),
        );

        if (mapLayers.length > 1) {
          const controlLayers = {};
          mapLayers.forEach((layerConf) => {
            controlLayers[layerConf.label] = layerConf.layer;
          });
          L.control.layers(controlLayers).addTo(map);
        }

        this.setFilters();
      },
      onCancelClick() {
        filters.forEach((filter) => {
          filter.items.forEach((item) => {
            item.isSelected = false;
          });
          filter.selectedItems = [];
          filter.isOpen = false;
        });
        selectedFilters = [];
        this.setFilters();
      },
      getMultiselectLabel(option) {
        return `${option.label} (${option.nbSites})`;
      },
      onMultiselectInput(filter, selectedItems) {
        let selectedFilterExists = selectedFilters.find((selectedFilter) => {
          return selectedFilter.name == filter.name;
        });

        if (selectedItems.length) {
          if (!selectedFilterExists) {
            selectedFilterExists = {
              name: filter.name,
              items: [],
            };
            selectedFilters.push(selectedFilterExists);
          }
          selectedFilterExists.items = selectedItems.map((item) => {
            return {
              id: item.id,
              label: item.label,
            };
          });
        } else {
          selectedFilters = selectedFilters.filter((selectedFilter) => {
            return selectedFilter.name != filter.name;
          });
        }

        filter.items.forEach((item) => {
          item.isSelected = Boolean(
            selectedItems.find((selectedItem) => {
              return selectedItem.id == item.id;
            }),
          );
        });

        this.setFilters();
      },
      onFilterClick(filter, item) {
        let selectedFilterExists = selectedFilters.find((selectedFilter) => {
          return selectedFilter.name == filter.name;
        });
        if (item.isSelected) {
          if (!selectedFilterExists) {
            selectedFilterExists = {
              name: filter.name,
              items: [],
            };
            selectedFilters.push(selectedFilterExists);
          }
          selectedFilterExists.items.push({
            id: item.id,
            label: item.label,
          });
        } else {
          selectedFilterExists.items = selectedFilterExists.items.filter((selectedItem) => {
            return selectedItem.id != item.id;
          });
          if (!selectedFilterExists.items.length) {
            selectedFilters = selectedFilters.filter((selectedFilter) => {
              return selectedFilter.name != filter.name;
            });
          }
        }

        filter.selectedItems = filter.items.filter((item) => {
          return item.isSelected;
        });

        this.setFilters();
      },
      setFilters() {
        /* const filterThemes = filters.find((filter) => {
          return filter.name == 'themes';
        });
        let selectedThemes = filterThemes.items.filter((item) => {
          return item.isSelected;
        });
        if (!selectedThemes.length) {
          selectedThemes = filterThemes.items;
        }

        const selectedSubthemes = options.filters
          .find((filter) => {
            return filter.name == 'subthemes';
          })
          .items.filter((item) => {
            return _.intersectionWith(item.themes, selectedThemes, function (a, b) {
              return a == b.id;
            }).length;
          });

        filters.find((filter) => {
          return filter.name == 'subthemes';
        }).items = selectedSubthemes; */

        localStorage.setItem('geopsg.sites.selectedFilters', JSON.stringify(selectedFilters));

        const cascadingFilters = selectedFilters.map((selectedFilter) => {
          return selectedFilter.name;
        });
        filters.forEach((filter) => {
          if (!cascadingFilters.includes(filter.name)) {
            cascadingFilters.push(filter.name);
          }
        });

        let selectedSites = options.sites;
        cascadingFilters.forEach((filterName) => {
          const filter = filters.find((filter) => {
            return filter.name == filterName;
          });
          filter.items.forEach((item) => {
            let sitesByItem = selectedSites.filter((site) => {
              let prop = _.get(site, filter.name);
              if (!Array.isArray(prop)) {
                prop = [prop];
              }

              return prop.includes(item.id);
            });
            item.nbSites = sitesByItem.length;
          });

          /*  filter.selectedItems = filter.items.filter((item) => {
            return item.isSelected;
          }); */
          let selectedIds = filter.selectedItems.map((item) => {
            return item.id;
          });
          filter.selectedIds = selectedIds;

          selectedSites = selectedSites.filter((site) => {
            let prop = _.get(site, filter.name);
            if (!Array.isArray(prop)) {
              prop = [prop];
            }
            const itemsToMap = filter.selectedIds.length ? filter.selectedItems : filter.items;
            let ids = itemsToMap.map((item) => {
              return item.id;
            });
            return _.intersection(prop, ids).length;
          });
        });

        options.sites.forEach((site) => {
          site.marker = null;
        });

        observatories.forEach((observatory) => {
          observatory.markers.clearLayers();
        });
        markers = [];

        const lats = [];
        const lons = [];
        selectedSites.forEach((site) => {
          lats.push(site.latlon[0]);
          lons.push(site.latlon[1]);
          let marker = L.marker(site.latlon, { icon: getMarkerIcon(site) });
          site.marker = marker;
          markerText = site.name_site + '<br />' + site.ville.label;
          if (site.ref_site) {
            markerText += '<br/>' + '(réf : ' + site.ref_site + ')';
          }
          marker.bindPopup(
            '<div class="img" style="background-image: url(' +
              site.photo +
              ');"></div><div class="title">' +
              markerText +
              '</div>',
            {
              closeButton: false,
            },
          );
          marker.on('mouseover', (e) => {
            marker.openPopup();
          });
          marker.on('mouseout', (e) => {
            marker.closePopup();
          });
          marker.on('click', (e) => {
            //TODO
            window.location.href = site.link.replace('http://127.0.0.1:8000', '');
          });
          observatories
            .find((observatory) => {
              return observatory.id == site.id_observatory;
            })
            .markers.addLayer(marker);
          markers.push(marker);
        });
        this.selectedSites = selectedSites;
        if (!markers.length) {
          try {
            map.getBounds();
            return;
          } catch (error) {
            options.sites.forEach((site) => {
              lats.push(site.latlon[0]);
              lons.push(site.latlon[1]);
            });
          }
        }
        lats.sort();
        lons.sort();
        mapBounds = {
          bbox: [
            [lats[0], lons[0]],
            [lats[lats.length - 1], lons[lons.length - 1]],
          ],
          options: {
            maxZoom: options.dbconf.zoom_max_fitbounds_map,
          },
        };
        map.fitBounds(mapBounds.bbox, mapBounds.options);
      },
      onSiteMousover(site) {
        site.marker.openPopup();
        map.panTo(site.latlon);
      },
      onSiteMouseout(site) {
        site.marker.closePopup();
      },
      async onShareClick() {
        this.shareUrl = url.origin + url.pathname;
        try {
          const filters = JSON.parse(localStorage.getItem('geopsg.sites.selectedFilters'));
          if (!filters || !filters.length) {
            return;
          }
          const sharedFilters = filters.map((filter) => {
            return {
              name: filter.name,
              values: (filter.items || []).map((item) => {
                return item.id;
              }),
            };
          });
          this.shareUrl += `?filters=${JSON.stringify(sharedFilters)}`;
        } catch (error) {}

        try {
          await navigator.clipboard.writeText(this.shareUrl);
          this.$bvToast.toast('Le lien est prêt à être coller.', {
            title: 'Copié !',
            variant: 'success',
            solid: true,
          });
        } catch (error) {
          this.$refs['modal-copy-url'].show();
        }
      },
    },
  });
};
