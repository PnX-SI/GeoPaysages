var geopsg = geopsg || {};
geopsg.initSites = (options) => {
  const utils = geopsg.getSitesUtils();

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
    } catch (error2) { }
  }

  url.searchParams.delete('filters');
  window.history.replaceState({}, '', url);

  if (!Array.isArray(selectedFilters)) {
    selectedFilters = [];
  }
  selectedFilters = selectedFilters.filter((selectedFilter) => {
    return options.filters.find((filter) => {
      return filter.name === selectedFilter.name;
    });
  });
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

  const isMultiObservatories = Boolean(options.observatories.length > 1);
  const observatories = options.observatories.map((observatory) => {
    return {
      ...observatory,
      isOpen: !isMultiObservatories,
    };
  });

  Vue.component('v-multiselect', window.VueMultiselect.default);

  new Vue({
    el: '#js-app-sites',
    data: () => {
      return {
        isSitesListOpen: window.innerWidth >= 768,
        filters: filters,
        selectedFilters: selectedFilters,
        themes: filters.find((filter) => filter.name == 'themes').items,
        selectedSites: [],
        observatories: observatories,
        isMultiObservatories: isMultiObservatories,
        showModalFilters: false,
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
            position: 'bottomleft',
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
          const color = observatory.data.color;
          if (observatory.data.geom) {
            const layer = utils.getObservatoryLayer(observatory.data.geom, color);
            layer.addTo(map);
            observatory.layer = layer;
          }
          observatory.markers = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
              return new L.DivIcon({
                html: `<div style="color:${color};border-color: ${color};"><span>${cluster.getChildCount()}</span></div>`,
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
          filter.selectedItems = [];
          filter.isOpen = false;
        });
        this.selectedFilters = [];
        this.setFilters();
      },
      onShowModalFiltersClick() {
        this.showModalFilters = true;
      },
      onCloseModalFiltersClick() {
        this.showModalFilters = false;
      },
      getMultiselectLabel(option) {
        return option.label;
      },
      onMultiselectInput(filter, selectedItems) {
        let selectedFilterExists = this.selectedFilters.find((selectedFilter) => {
          return selectedFilter.name == filter.name;
        });

        if (selectedItems.length) {
          if (!selectedFilterExists) {
            selectedFilterExists = {
              name: filter.name,
              items: [],
            };
            this.selectedFilters.push(selectedFilterExists);
          }
          selectedFilterExists.items = selectedItems.map((item) => {
            return {
              id: item.id,
              label: item.label,
            };
          });
        } else {
          this.selectedFilters = this.selectedFilters.filter((selectedFilter) => {
            return selectedFilter.name != filter.name;
          });
        }

        this.setFilters();
      },
      setFilters() {
        localStorage.setItem('geopsg.sites.selectedFilters', JSON.stringify(this.selectedFilters));

        const cascadingFilters = this.selectedFilters.map((selectedFilter) => {
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
          const initFilter = options.filters.find((initFilter) => {
            return initFilter.name == filter.name;
          });
          filter.items = initFilter.items
            .map((item) => {
              let sitesByItem = selectedSites.filter((site) => {
                let prop = _.get(site, filter.name);
                if (!Array.isArray(prop)) {
                  prop = [prop];
                }

                return prop.includes(item.id);
              });
              return {
                ...item,
                nbSites: sitesByItem.length,
              };
            })
            .filter((item) => {
              return !filter.hideNoMatched || item.nbSites > 0;
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

        observatories.forEach((observatory) => {
          observatory.markers.clearLayers();
        });
        markers = [];

        const lats = [];
        const lons = [];
        selectedSites.forEach((site) => {
          lats.push(site.latlon[0]);
          lons.push(site.latlon[1]);
          let marker = L.marker(site.latlon, { icon: utils.getMarkerIcon(site) });
          site.marker = marker;
          const color = site.observatory.color;
          let themeIcon = _.get(site, 'main_theme.icon', '');
          if (themeIcon) {
            themeIcon = `<span class="icon" style="fill:${color};">${themeIcon}</span>`;
          }
          markerText = `<div>
            <div class="site-name" style="color:${color}">
              ${themeIcon}
              <b>${site.name_site}</b>
            </div>
            ${site.ville.label}
          </div>`;
          if (site.ref_site) {
            markerText += '(réf : ' + site.ref_site + ')';
          }
          imgUrl = `/api/thumbor/presets/200x150/${site.photo}`;
          marker.bindPopup(
            '<a href="/sites/' + site.id_site + '" style="text-decoration: none; color: black;"><div class="img" style="background-image: url(' +
            imgUrl +
            ');"></div><div class="title">' +
            markerText +
            '</div></a>',
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
            if (window.innerWidth >= 768) {
              window.location.href = `/sites/${site.id_site}`;
            } else {
              this.onSiteMousover(site);
            }
          });
          observatories
            .find((observatory) => {
              return observatory.id == site.id_observatory;
            })
            .markers.addLayer(marker);
          markers.push(marker);
        });
        this.observatories.forEach((observatory) => {
          observatory.selectedSites = selectedSites.filter((selectedSite) => {
            return selectedSite.id_observatory == observatory.id;
          });
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
        } catch (error) { }

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
      onBtnObservatoryClick(observatory) {
        const layerRef = observatory.layer || observatory.markers;
        map.fitBounds(layerRef.getBounds(), {
          maxZoom: options.dbconf.zoom_max_fitbounds_map,
        });
      },
    },
  });
};
