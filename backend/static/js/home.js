var geopsg = geopsg || {};

geopsg.initHome = (options) => {
  if (!options.carousel.photos.length) {
    document.getElementById('js-app-home-carousel').classList.add('d-none');
  } else {
    new Vue({
      el: '#js-app-home-carousel',
      data: () => {
        return {
          photos: options.carousel.photos
            .map((filename) => {
              return encodeURIComponent(filename);
            })
            .sort(),
        };
      },
      methods: {
        onScrollClick() {
          window.scrollTo({
            top: this.$refs.btnScroll.getBoundingClientRect().bottom,
            behavior: 'smooth'
          });
        }
      }
    });
  }
};
