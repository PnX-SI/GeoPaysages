var oppv = oppv || {};
oppv.initMap = (options) => {
  const storedSelectedFilters = JSON.parse(localStorage.getItem('oppv.map.selectedFilters'));
  options.filters.forEach(filter => {
    filter.selectedItems = [];
    filter.items.forEach(item => {
      let isSelected = _.get(storedSelectedFilters, filter.name, []).indexOf(item.id) > -1
      Object.assign(item, {
        isSelected: isSelected
      })
      if (isSelected)
        filter.selectedItems.push(item);
    })
  })
  const filters = _.cloneDeep(options.filters)
  let map;
  let markers = []
  let mapBounds;

  new Vue({
    el: '#js-app-map',
    data: () => {
      return {
        isSidebarCollapsed: false,
        filters: filters,
        sites: options.sites,
        selectedSites: []
      }
    },
    mounted() {
      this.initMap()
    },
    methods: {
      initMap() {
        const layerConfs = [{
          label: "OSM classic",
          layer: L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: options.dbconf.zoom_map,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }
          )
        }, {
          label: "IGN map",
          layer: L.tileLayer(
            'http://wxs.ign.fr/' + options.ign_Key +
            '/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&' +
            'LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&TILEMATRIXSET=PM&' +
            'TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg', {
              maxZoom: options.dbconf.zoom_map,
              attribution: '&copy; <div">IgnMap</div>',
            }
          )
        }]

        map = L.map(this.$refs.map, {
          zoomControl: false,
          layers: [layerConfs[0].layer]
        })

        L.control.scale({
          position: 'bottomright',
          imperial: false
        }).addTo(map);

        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        L.easyButton({
          position: 'topright',
          states: [{
            stateName: 'reset',
            onClick: function (button, map) {
              if (mapBounds)
                map.fitBounds(mapBounds.bbox, mapBounds.options)
            },
            icon: 'icon ion-md-locate'
          }]
        }).addTo(map)

        map.addControl(new L.Control.Fullscreen({
          position: 'topright'
        }));

        const controlLayers = {};
        layerConfs.forEach(layerConf => {
          controlLayers[layerConf.label] = layerConf.layer
        })
        L.control.layers(controlLayers).addTo(map);

        this.setFilters()
      },
      onCancelClick() {
        filters.forEach(filter => {
          filter.items.forEach(item => {
            item.isSelected = false;
          });
          filter.items.selectedItems = [];
        });
        this.updateFilters()
        this.setFilters()
      },
      onFilterClick(filter, item) {
        this.updateFilters()
        this.setFilters()
      },
      updateFilters() {
        const filterThemes = filters.find(filter => {
          return filter.name == 'themes'
        })
        let selectedThemes = filterThemes.items.filter(item => {
          return item.isSelected
        })
        if (!selectedThemes.length)
          selectedThemes = filterThemes.items

        const selectedSubthemes = options.filters.find(filter => {
          return filter.name == 'subthemes'
        }).items.filter(item => {
          return _.intersectionWith(item.themes, selectedThemes, function (a, b) {
            return a == b.id
          }).length
        })

        filters.find(filter => {
          return filter.name == 'subthemes'
        }).items = selectedSubthemes
      },
      setFilters() {
        let storedSelectedFilters = {}
        let selectedFilters = filters.map(filter => {
          let selectedItems = filter.items.filter(item => {
            return item.isSelected
          })
          //let items = selectedItems.length ? selectedItems : filter.items
          let selectedIds = selectedItems.map(item => {
            return item.id
          })
          if (selectedIds.length)
            storedSelectedFilters[filter.name] = selectedIds
          return Object.assign({}, filter, {
            selectedIds: selectedIds
          })
        })
        localStorage.setItem('oppv.map.selectedFilters', JSON.stringify(storedSelectedFilters))

        let selectedSites = []
        options.sites.forEach(site => {
          site.marker = null
          unmatchedProp = selectedFilters.find(filter => {
            let prop = _.get(site, filter.name)
            if (!Array.isArray(prop))
              prop = [prop]
            let ids = filter.selectedIds.length ?
              filter.selectedIds :
              filter.items.map(item => {
                return item.id
              })
            return !_.intersection(prop, ids).length
          })
          if (!unmatchedProp)
            selectedSites.push(site)
        })

        markers.forEach(marker => {
          map.removeLayer(marker)
        })
        markers = []

        const lats = []
        const lons = []
        selectedSites.forEach(site => {
          lats.push(site.latlon[0])
          lons.push(site.latlon[1])
          let marker = L.marker(site.latlon)
          site.marker = marker
          markerText = site.name_site + '<br />' + site.ville.label
          marker.bindPopup('<div class="img" style="background-image: url(' + site.photos[site.photos.length - 1].url + ');"></div><div class="title">' + markerText + '</div>', {
            closeButton: false
          })
          marker.on('mouseover', (e) => {
            marker.openPopup()
          })
          marker.on('mouseout', (e) => {
            marker.closePopup()
          })
          marker.on('click', (e) => {
            //TODO
            window.location.href = site.link.replace('http://127.0.0.1:8000', '')
          })
          marker.addTo(map)
          markers.push(marker)
        });
        this.selectedSites = selectedSites;
        if (!markers.length)
          return
        lats.sort()
        lons.sort()
        mapBounds = {
          bbox: [
            [lats[0], lons[0]],
            [lats[lats.length - 1], lons[lons.length - 1]]
          ],
          options: {
            maxZoom: options.dbconf.zoom_max_fitbounds_map
          }
        }
        map.fitBounds(mapBounds.bbox, mapBounds.options)
      },
      onSiteMousover(site) {
        site.marker.openPopup()
        map.panTo(site.latlon)
      },
      onSiteMouseout(site) {
        site.marker.closePopup()
      }
    }
  })
}
