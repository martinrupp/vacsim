// part of this is copied from the very awesome https://github.com/binji/wasm-clang
		
function sleep(ms) {
  return new Promise((resolve, _) => setTimeout(resolve, ms));
}


function debounceLazy(f, ms) {
  let waiting = 0;
  let running = false;

  const wait = async () => {
    ++waiting;
    await sleep(ms);
    return --waiting === 0;
  };

  const wrapped = async (...args) => {
    if (await wait()) {
      while (running) await wait();
      running = true;
      try {
        await f(...args);
      } finally {
        running = false;
      }
    }
  };
  return wrapped;
}

let canvas;
var context;
function CanvasComponent(container, state)
{
  const canvasEl = document.createElement('canvas');
  canvasEl.className = 'canvas';
  container.getElement()[0].appendChild(canvasEl);

  const w = 400;
  const h = 650;
  canvasEl.width = w;
  canvasEl.height = h;
  const ctx2d = canvasEl.getContext('2d');
  context = ctx2d;
  context.scale(2,2);

  drawFirst(context, map);
}

function EditorComponent(container, state) {
  editor = ace.edit(container.getElement()[0]);
  editor.session.setMode('ace/mode/javascript');
  editor.setKeyboardHandler('ace/keyboard/sublime');
  editor.setOption('fontSize',);
  editor.setValue(state.value || '');
  editor.clearSelection();

  const setFontSize = fontSize => {
    container.extendState({fontSize});
    editor.setFontSize(`${fontSize}px`);
  };

  setFontSize(14);

  editor.on('change', debounceLazy(event => {
    container.extendState({value: editor.getValue()});
    codeChanged(editor.getValue());
  }, 500));

  container.on('fontSizeChanged', setFontSize);
  container.on('resize', debounceLazy(() => editor.resize(), 20));
  container.on('destroy', () => {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  });
}
class Layout extends GoldenLayout {
  constructor(config) {
    // let layoutConfig = localStorage.getItem(options.configKey);
    // if (layoutConfig) {
    //   layoutConfig = JSON.parse(layoutConfig);
    // } else {
    //   layoutConfig = options.defaultLayoutConfig;
    // }

    super(config, $('#layout'));

    this.on('stateChanged', debounceLazy(() => {
      const state = JSON.stringify(this.toConfig());
      localStorage.setItem(config.configKey, state);
    }, 500));

    this.on('stackCreated', stack => {
      const fontSizeEl = document.createElement('div');

      const labelEl = document.createElement('label');
      labelEl.textContent = 'FontSize: ';
      fontSizeEl.appendChild(labelEl);

      const selectEl = document.createElement('select');
      fontSizeEl.className = 'font-size';
      fontSizeEl.appendChild(selectEl);

      const sizes = [6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96];
      for (let size of sizes) {
        const optionEl = document.createElement('option');
        optionEl.value = size;
        optionEl.textContent = size;
        selectEl.appendChild(optionEl);
      }

      fontSizeEl.addEventListener('change', event => {
        const contentItem = stack.getActiveContentItem();
        const name = contentItem.config.componentName;
        contentItem.container.emit('fontSizeChanged', event.target.value);
      });

      stack.header.controlsContainer.prepend(fontSizeEl);

      stack.on('activeContentItemChanged', contentItem => {
        const name = contentItem.config.componentName;
        const state = contentItem.container.getState();
        if (state && state.fontSize) {
          fontSizeEl.style.display = '';
          selectEl.value = state.fontSize;
        } else {
          fontSizeEl.style.display = 'none';
        }
      });
    });
  }
}

var myLayout;
function createLayout(code)
{
	var config = {
    settings:{
        hasHeaders: true,
        constrainDragToContainer: true,
        reorderEnabled: true,
        selectionEnabled: false,
        popoutWholeStack: false,
        blockedPopoutsThrowError: true,
        closePopoutsOnUnload: true,
        showPopoutIcon: false,
        showMaximiseIcon: false,
        showCloseIcon: false,

    },
 
	    content: [{
	        type: 'row',
	        content:[{
	            type: 'component',
	            componentName: 'editor',
	            componentState: {fontSize: 18, value: code},
              isClosable: false
	        },{
	            type: 'column',
	            content:[{
	                type: 'component',
	                componentName: 'canvas',
	                componentState: { label: 'B' },
                  isClosable: false
	            }
              ]
	        }]
	    }]
	};


	var myLayout = new Layout( config );
	myLayout.registerComponent('editor', EditorComponent);
	myLayout.registerComponent('canvas', CanvasComponent);
	myLayout.registerComponent( 'testComponent', function( container, componentState ){
	    container.getElement().html( '<h2>' + componentState.label + '</h2>' );
	});
	myLayout.init();

	$(window).resize(function () {
	myLayout.updateSize($(window).width(), $(window).height());
	});
}

$('#run').on('click', event => { run(); } );
$('#reset').on('click', event => { reset(); } );
$('#compile').on('click', event => { compile(); } );
