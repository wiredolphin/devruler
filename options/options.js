/**
* DevRuler logic. This script is executed by onupdate.js
* at page loading time.
* Author: vince damiani 2019;
*/

/**
* Just log the error to the console.
* @param {String} error
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

/**
* Default ruler appearence.
*/
var defaults = {
  rulerBg: 'rgba(17, 104, 104, 0.8)',
  rulerFg: 'rgba(10, 255, 203, 0.91)',
  breakpointsBg: 'rgba(217, 0, 101, 0.61)',
  breakpointsFg: 'rgba(255, 255, 255, 0.61)',
  marginTop: 0
}

/**
* Initialize options page controls and logic
*/
function initOptions() {

  const rulerBg = document.querySelector('#ruler-bg > .options-color'),
  rulerFg = document.querySelector('#ruler-fg > .options-color'),
  breakpointsBg = document.querySelector('#breakpoints-bg > .options-color'),
  breakpointsFg = document.querySelector('#breakpoints-fg > .options-color'),
  marginTop = document.querySelector("#options-form #margin-top"),
  resetButton = document.querySelector(".options-buttons > button[type='button']");

  /**
  * Set controls styles and values from the options.
  * @param {object} options
  */
  function setOptions(opt) {
    rulerBg.style.backgroundColor = rulerBg.firstElementChild.value = opt.rulerBg;
    rulerFg.style.backgroundColor = rulerFg.firstElementChild.value = opt.rulerFg;
    breakpointsBg.style.backgroundColor = breakpointsBg.firstElementChild.value = opt.breakpointsBg;
    breakpointsFg.style.backgroundColor = breakpointsFg.firstElementChild.value = opt.breakpointsFg;
    marginTop.value = opt.marginTop;
  }

  /**
  * Load options from the browser storage.
  */
  function loadOptions() {
    var getting = browser.storage.sync.get();
    getting.then(function(sett) {
      let opt = sett.devRulerOptions;
      if (!opt) {
        opt = defaults;
      }
      setOptions(opt);
      createPickers(opt);
      createSliders(opt);
    }).catch(onError);
  }

  /**
  * Set color type controls color and value.
  * @param {string} color in hex format
  */
  function setColor(color) {
    if (!this.settings) {
      throw "Not a valid color picker";
    } 
    let parent = this.settings.parent;
    parent.style.backgroundColor = color.hex;
    parent.firstElementChild.value = color.hex;
    saveOptions();
  }

  /**
  * Retrieve values from form fields.
  */
  function getValues() {
    return {
      devRulerOptions: {
        rulerBg: rulerBg.firstElementChild.value,
        rulerFg: rulerFg.firstElementChild.value,
        breakpointsBg: breakpointsBg.firstElementChild.value,
        breakpointsFg: breakpointsFg.firstElementChild.value,
        marginTop: marginTop.value
      }
    }
  }

  /**
  * Store options to the browser storage.
  */
  function saveOptions() {
    browser.storage.sync.set(getValues());
    const gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(function(settings) {
      browser.tabs.query({})
        .then(function(tabs){
          tabs.forEach(function(tab){
            if (settings.tabs && settings.tabs.has(tab.id)) {
              browser.tabs.sendMessage(tab.id, {
                command: "updateStyles"
              });
            }
          });
        });
    });
  }

  /**
  * Restore default settings.
  */
  function restoreOptions(e) {
    if (e) e.preventDefault();
    setOptions(defaults);
    saveOptions();
  }

  /**
  * Create range-slider and add required handlers.
  * @param {object} options
  */
  function createSliders(opt) {
    rangeSlider.create(marginTop, {
      polyfill: true,
      root: document,
      rangeClass: 'rangeSlider',
      disabledClass: 'rangeSlider--disabled',
      fillClass: 'rangeSlider__fill',
      bufferClass: 'rangeSlider__buffer',
      handleClass: 'rangeSlider__handle',
      startEvent: ['mousedown', 'touchstart', 'pointerdown'],
      moveEvent: ['mousemove', 'touchmove', 'pointermove'],
      endEvent: ['mouseup', 'touchend', 'pointerup'],
      vertical: false,
      min: 0,
      max: 90,
      step: 1,
      value: marginTop.value,
      buffer: 0,
      onInit: function () {
        let handle = this.range.querySelector(".rangeSlider__handle");
        let handleValueElm = document.createElement("div");
        handleValueElm.className = "rangeSlider__handle__value";
        handleValueElm.innerText = this.value + " %";
        handle.appendChild(handleValueElm);
      },
      onSlideStart: function (position, value) {},
      onSlide: function (position, value) {
        let handle = this.range.querySelector(".rangeSlider__handle__value");
        handle.innerText = this.value + " %";
      },
      onSlideEnd: function (position, value) {
        saveOptions();
      }
    });
  }

  /**
  * Create color pickers.
  * @param {object} options
  */
  function createPickers(opt) {
    let rulerBgPicker = new Picker({
      parent: rulerBg,
      color: opt.rulerBg,
      onDone: setColor
    }),
    rulerFgPicker = new Picker({
      parent: rulerFg,
      color: opt.rulerFg,
      onDone: setColor
    }),
    breakpointsBgPicker = new Picker({
      parent: breakpointsBg,
      color: opt.breakpointsBg,
      onDone: setColor
    }),
    breakpointsFgPicker = new Picker({
      parent: breakpointsFg,
      color: opt.breakpointsFg,
      onDone: setColor
    })
  }

  
  loadOptions();
  resetButton.addEventListener("click", restoreOptions);
}

document.addEventListener("DOMContentLoaded", initOptions);








