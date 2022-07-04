var geopsg = geopsg || {};
geopsg.initGallery = (options) => {
  let selectedFilters = [];
  try {
    selectedFilters = JSON.parse(localStorage.getItem('geopsg.gallery.selectedFilters'));
  } catch (error1) {
    try {
      selectedFilters = JSON.parse(localStorage.getItem('geopsg.gallery.selectedFilters'));
    } catch (error2) {}
  }

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

  const observatories = options.observatories.map((observatory) => {
    return {
      ...observatory,
      isOpen: false,
    };
  });

  const isMultiObservatories = observatories.length > 1;

  Vue.use(VueLazyload);
  Vue.component('v-multiselect', window.VueMultiselect.default);

  new Vue({
    el: '#js-app-gallery',
    data: () => {
      return {
        isSidebarCollapsed: false,
        filters: filters,
        themes: filters.find((filter) => filter.name == 'themes').items,
        selectedSites: [],
        observatories: observatories,
        isMultiObservatories: isMultiObservatories,
        filterLimitText: (count) => {
          return `+ ${count}`;
        },
      };
    },
    mounted() {
      this.setFilters();
    },
    methods: {
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
        localStorage.setItem('geopsg.gallery.selectedFilters', JSON.stringify(selectedFilters));

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

        this.observatories.forEach((observatory) => {
          observatory.selectedSites = selectedSites.filter((selectedSite) => {
            return selectedSite.id_observatory == observatory.id;
          });
        });
        this.selectedSites = selectedSites;
        console.log(selectedSites);
      },
      onSiteMousover(site) {},
      onSiteMouseout(site) {},
    },
  });
};
