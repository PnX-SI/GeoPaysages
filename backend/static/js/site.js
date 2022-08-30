var geopsg = geopsg || {};
geopsg.site = (options) => {
  const sitesUtils = geopsg.getSitesUtils();
  new Vue({
    el: '#js-app-site',
    data: () => {
      return {
        textCollapses: ['description', 'testimonial', 'stheme'],
        textCollapsables: [],
        textCollapseds: []
      }
    },
    mounted() {
      this.initTextCollapses()
      this.initMap()
    },
    computed: {
      textCollapseClsDescription() {
        return {
          'text-collapsable': this.textCollapsables.indexOf('description') > -1,
          'text-collapsed': this.textCollapseds.indexOf('description') > -1
        }
      },
      textCollapseClsTestimonial() {
        return {
          'text-collapsable': this.textCollapsables.indexOf('testimonial') > -1,
          'text-collapsed': this.textCollapseds.indexOf('testimonial') > -1
        }
      },
      textCollapseClsStheme() {
        return {
          'text-collapsable': this.textCollapsables.indexOf('stheme') > -1,
          'text-collapsed': this.textCollapseds.indexOf('stheme') > -1
        }
      }
    },
    methods: {
      initTextCollapses() {
        this.textCollapseds = this.textCollapses.slice()
        let setCollapsables = () => {
          let collapseds = this.textCollapseds.slice();
          this.textCollapsables = this.textCollapses.slice()
          this.textCollapseds = this.textCollapses.slice()
          this.$nextTick(() => {
            this.textCollapsables = []
            this.textCollapses.forEach(name => {
              let el = this.$refs['text_collapse_' + name]
              if (!el)
                return;
              let target = el.getElementsByClassName('target')[0]
              if (target.scrollHeight > target.clientHeight)
                this.textCollapsables.push(name)
            })
            this.textCollapseds = collapseds
          })
        }
        window.addEventListener('resize', () => {
          setCollapsables()
        })
        setCollapsables()
      },
      toggleTextCollapse(name) {
        let i = this.textCollapseds.indexOf(name)
        if (i > -1)
          this.textCollapseds.splice(i, 1)
        else
          this.textCollapseds.push(name)
      },
      initMap() {
        let layersConf = _.get(options.dbconf, 'map_layers', []);
        if (!Array.isArray(layersConf)) {
          layersConf = [];
        }
        if (!layersConf.length) {
          layersConf.push({
            "label": "OSM classic",
            "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "options": {
              "maxZoom": 18,
              "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
            }
          })
        }
        let mapLayers = layersConf.map(layer => {
          return {
            label: layer.label,
            layer: L.tileLayer(layer.url, layer.options)
          }
        })

        map = L.map(this.$refs.map, {
          center: options.site.geom,
          zoom: options.dbconf.zoom_map_comparator,
          layers: [mapLayers[0].layer]
        })

        L.control.scale({
          position: 'bottomleft',
          imperial: false
        }).addTo(map);

        if (mapLayers.length > 1) {
          const controlLayers = {};
          mapLayers.forEach(layerConf => {
            controlLayers[layerConf.label] = layerConf.layer
          })
          L.control.layers(controlLayers).addTo(map);
        }

        L.marker(options.site.geom, { icon: sitesUtils.getMarkerIcon(options.site, {
          showThemeIcon: false
        }) }).addTo(map)
      }
    }
  })
}
