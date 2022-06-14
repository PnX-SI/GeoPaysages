var geopsg = geopsg || {};
geopsg.initSites = (options) => {
  let selectedFilters = JSON.parse(localStorage.getItem('geopsg.sites.selectedFilters'));
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

  const filterObservatories = filters.find((filter) => {
    return filter.name == 'id_observatory';
  });
  const observatories = filterObservatories ? filterObservatories.items : null;

  new Vue({
    el: '#js-app-sites',
    data: () => {
      return {
        isSidebarCollapsed: false,
        filters: filters,
        sites: options.sites,
        selectedSites: [],
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

        if (observatories) {
          observatories.forEach((observatory) => {
            L.geoJson(wellknown.parse(observatory.data.geom), {
              style: {
                color: observatory.data.color,
                weight: 2,
                opacity: 1,
                fillColor: observatory.data.color,
                fillOpacity: 0.3,
              },
            }).addTo(map);
          });
        }

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
          filter.isOpen = false;
        });
        selectedFilters = [];
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

          filter.selectedItems = filter.items.filter((item) => {
            return item.isSelected;
          });
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

        markers.forEach((marker) => {
          map.removeLayer(marker);
        });
        markers = [];

        const lats = [];
        const lons = [];
        selectedSites.forEach((site) => {
          lats.push(site.latlon[0]);
          lons.push(site.latlon[1]);
          let marker = L.marker(site.latlon);
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
          marker.addTo(map);
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
    },
  });
};
