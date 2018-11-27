var oppv = oppv || {};
oppv.initHome = (options) => {
  let gutter = 20;
  let container = document.querySelector('.blocks');

  let block_map = document.querySelector('.block-map');
  let block_1 = document.querySelector('.block-1');
  let block_2 = document.querySelector('.block-2');
  let block_3 = document.querySelector('.block-3');
  let block_4 = document.querySelector('.block-4');
  let block_5 = document.querySelector('.block-5');
  let block_6 = document.querySelector('.block-6');

  window.addEventListener('resize', () => {
    onResize()
    //let containerW = document.querySelector('.blocks')
  })
  onResize()

  function onResize() {
    if (window.matchMedia("(min-width: 800px)").matches) {

      container.style.height = null;
      container.style.width = null;

      let containerW = container.clientWidth;
      let containerH = container.clientHeight;

      let blockSM = (containerH * 1 / 3);
      let blockBG = (containerH * 2 / 3);

      block_1.style.height = (blockSM * 2) + 'px';
      block_1.style.width = block_1.style.height;

      block_2.style.height = blockSM + 'px';
      block_2.style.width = (blockSM * 2 + gutter) + 'px';
      block_2.style.left = (blockBG + gutter) + 'px';

      block_3.style.height = (blockSM * 2) + 'px';
      block_3.style.width = blockSM + 'px';
      block_3.style.left = (blockBG * 2 + gutter * 3) + 'px';

      block_4.style.height = (blockSM - gutter) + 'px';
      block_4.style.width = blockSM + 'px';
      block_4.style.left = (blockBG + gutter) + 'px';
      block_4.style.top = (blockSM + gutter) + 'px';

      block_5.style.height = (blockSM * 2 - gutter) + 'px';
      block_5.style.width = blockSM + 'px';
      block_5.style.left = (blockBG + blockSM + gutter * 2) + 'px';
      block_5.style.top = (blockSM + gutter) + 'px';

      block_map.style.height = (blockSM - gutter) + 'px';
      block_map.style.width = (blockSM * 3 + gutter) + 'px';
      block_map.style.left = 0 + 'px';
      block_map.style.top = (blockBG + gutter) + 'px';

      block_6.style.height = (blockSM - gutter) + 'px';
      block_6.style.width = blockSM + 'px';
      block_6.style.left = (blockBG * 2 + gutter * 3) + 'px';
      block_6.style.top = (blockSM * 2 + gutter) + 'px';

      container.style.width = (blockSM * 5 + gutter * 3) + 'px';

    } else {

      container.style.height = 'auto';
      container.style.width = 'auto';

      block_1.style.height = null;
      block_1.style.width = null;

      block_2.style.height = null;
      block_2.style.width = null;
      block_2.style.left = null;

      block_3.style.height = null;
      block_3.style.width = null;
      block_3.style.left = null;

      block_4.style.height = null;
      block_4.style.width = null;
      block_4.style.left = null;
      block_4.style.top = null;

      block_5.style.height = null;
      block_5.style.width = null;
      block_5.style.left = null;
      block_5.style.top = null;

      block_map.style.height = null;
      block_map.style.width = null;
      block_map.style.left = null;
      block_map.style.top = null;

      block_6.style.height = null;
      block_6.style.width = null;
      block_6.style.left = null;
      block_6.style.top = null;
    }
  }
}