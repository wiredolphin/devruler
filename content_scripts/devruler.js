/**
* DevRuler logic. This script is executed by onupdate.js
* at page loading time.
* Author: vince damiani 2019;
*/
(function() {
  /**
  * Check and set a global guard variable.
  * If this content script is injected into the same page again,
  * it will do nothing next time.
  */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  var breakpointsHtml = `
      <span class="bs-ruler-xs bs-breakpoint"></span>
      <span class="bs-ruler-sm bs-breakpoint"></span>
      <span class="bs-ruler-md bs-breakpoint"></span>
      <span class="bs-ruler-lg bs-breakpoint"></span>
  `;

  /**
  * Builds rulers elements and inner container.
  * @param {String} id of the node
  */
  function getRuler(id) {
    let ruler = document.createElement("div"), inner = document.createElement("div");
    ruler.id = id;
    inner.className = "ruler-inner";
    ruler.appendChild(inner);
    return ruler;
  }

  /**
  * Creates style node based on the settings stored 
  * within the browser storage. See options.
  */
  function setStyles() {
    let gettingOptions = browser.storage.sync.get();
    let head = document.head || document.getElementsByTagName('head')[0],
    style = document.getElementById('ruler-styles');

    if (style) {
      head.removeChild(style);
    }
    style = document.createElement("style");
    style.id = "ruler-styles";
    style.type = 'text/css';

    gettingOptions.then(function(settings) {
      let opt = settings.devRulerOptions; 
      let css = `
        #ruler > .ruler-inner { color: ${opt.rulerFg}; background-color: ${opt.rulerBg}; }
        .ruler-dec { border-right: 1px solid ${opt.rulerFg}; }
        .ruler-hundreds { border-right: 1px solid ${opt.rulerFg}; }
        .hundreds-count { color: ${opt.rulerFg}; }
        .bs-breakpoint { border-right: 1px solid ${opt.breakpointsBg}; }
        .bs-breakpoint:after { color: ${opt.breakpointsFg}; background-color: ${opt.breakpointsBg}; }
        #ruler { margin-top: ${opt.marginTop}vh; }
        #breakpoints { margin-top: ${opt.marginTop}vh; }
      `;
      style.appendChild(document.createTextNode(css));
      head.appendChild(style);
    });  
  }

  /**
  * Create ruler html.
  */
  function addRuler() {
    
    let vwWidth = document.documentElement.clientWidth, decCount = 0;
    let ruler = getRuler('ruler');
    ruler.firstChild.style.width = screen.width + 'px';

    while (decCount < screen.width) {
      decCount += 10;
      let dec = document.createElement('span');
      if (decCount % 100 == 0) {
        dec.className = 'ruler-hundreds';
        let text = document.createElement('span');
        text.innerText = decCount;
        text.className = 'hundreds-count';
        dec.appendChild(text);
      } else {
        dec.className = 'ruler-dec';
      }
      ruler.firstChild.appendChild(dec);
    }
    document.body.appendChild(ruler);
  }

  /**
  * Create breakpoints html.
  */
  function addBreakpoints() {
    let breakpoints = getRuler("breakpoints");
    breakpoints.firstChild.innerHTML = breakpointsHtml;
    document.body.appendChild(breakpoints);
  }

  /**
  * Delete ruler based on its id
  * @param {String} id of the ruler
  */
  function removeRuler(id) {
    let ruler = document.querySelector('body #' + id);
    if (ruler) {
      document.body.removeChild(ruler);
    }
  }

  /**
  * Listen for messages from the background script.
  */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "showRuler") {
      addRuler();
      setStyles();
    } else if (message.command === "resetRuler") {
      removeRuler("ruler");
    } else if (message.command === "showBreakpoints") {
      addBreakpoints();
      setStyles();
    } else if (message.command === "resetBreakpoints") {
      removeRuler("breakpoints");
    } else if (message.command === "updateStyles") {
      setStyles();
    }
  });
})();















