console.log('ready addEventListener');

document.onreadystatechange = () => {
  if (document.readyState == 'complete') {
    new Vue({
      el: '#js-app-comparator',
      data: {
        title: "title toto"
      }
    });
  }
};