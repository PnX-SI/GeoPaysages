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
        this.updateFilters();
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

        localStorage.setItem('geopsg.sites.selectedFilters', JSON.stringify(selectedFilters));

        this.updateFilters();
        this.setFilters();
      },
      updateFilters() {
        selectedFilters.forEach((selectedFilter) => {});

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
      },
      setFilters() {
        filters.forEach((filter) => {
          filter.selectedItems = filter.items.filter((item) => {
            return item.isSelected;
          });
          let selectedIds = filter.selectedItems.map((item) => {
            return item.id;
          });
          filter.selectedIds = selectedIds;
        });

        filters.forEach((filter) => {
          filter.items.forEach((item) => {
            const matchedSites = options.sites.filter((site) => {
              let prop = _.get(site, filter.name);
              if (!Array.isArray(prop)) {
                prop = [prop];
              }
              let ids = filter.selectedIds.length
                ? filter.selectedIds
                : filter.items.map((item) => {
                    return item.id;
                  });
              return _.intersection(prop, ids).length;
            });
            console.log(filter.name, item.label, matchedSites.length);
          });
        });

        let selectedSites = [];
        options.sites.forEach((site) => {
          site.marker = null;
          const unmatchedProp = filters.find((filter) => {
            let prop = _.get(site, filter.name);
            if (!Array.isArray(prop)) {
              prop = [prop];
            }
            let ids = filter.selectedIds.length
              ? filter.selectedIds
              : filter.items.map((item) => {
                  return item.id;
                });
            return !_.intersection(prop, ids).length;
          });
          // If one prop not match, the site is not pushed
          if (!unmatchedProp) {
            selectedSites.push(site);
          }
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
          return;
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
