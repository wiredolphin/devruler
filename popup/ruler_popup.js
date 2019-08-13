/**
* Popup logic
* Author: vince damiani 2019
*/
var optionsElm = {}, enabledTabs = undefined, currentTab = undefined;

/**
* Just log the error to the console.
* @param {string} error
*/
function onError(error) {
  console.error(`An error occurred: ${error}`);
}

/**
* Inject CSS file and send appropriate command
* @param {object} tabs
*/
function sendShowRuler(tabs) {
  browser.tabs.insertCSS({file: '/css/ruler.css'}).then(() => {
    browser.tabs.sendMessage(tabs[0].id, {
      command: "showRuler"
    });
  });
}

function sendShowBreakpoints(tabs) {
  browser.tabs.insertCSS({file: '/css/breakpoints.css'}).then(() => {
    browser.tabs.sendMessage(tabs[0].id, {
      command: "showBreakpoints"
    });
  });
}

function sendResetBreakpoints(tabs) {
  browser.tabs.removeCSS({file: '/css/breakpoints.css'}).then(() => {
    browser.tabs.sendMessage(tabs[0].id, {
      command: "resetBreakpoints"
    });
  });
}

function reset(tabs) {
  browser.tabs.removeCSS({file: '/css/ruler.css'}).then(() => {
    browser.tabs.sendMessage(tabs[0].id, {
      command: "resetRuler",
    });
  });
}

/**
* Toggle Ruler taking account of the popup entry checkbox
* @param {bool} state
*/
function toggleRuler(state) {
  if (state) {
    browser.tabs.query({active: true, currentWindow: true})
      .then(sendShowRuler)
      .catch(onError);
  } else {
    browser.tabs.query({active: true, currentWindow: true})
      .then(reset)
      .catch(onError);
  }
}

/**
* Toggle Breakpoints taking account of the popup entry checkbox
* @param {bool} state
*/
function toggleBreakpoints(state) {
  if (state) {
    browser.tabs.query({active: true, currentWindow: true})
      .then(sendShowBreakpoints)
      .catch(onError);
  } else {
    browser.tabs.query({active: true, currentWindow: true})
      .then(sendResetBreakpoints)
      .catch(onError);
  }
}

/**
* Stores settings for the current tab to the 
* browser local storage
*/
function storeSettings() {
  if (!currentTab) {
    throw "Cannot determine tab id while storing settings!";
  }

  if (!optionsElm.state.checked && !optionsElm.bsbState.checked) {
    // Neither setting is checked, let's delete current tab from Map
    enabledTabs.delete(currentTab);
  } else {
    enabledTabs.set(currentTab, { 
      state: optionsElm.state.checked,
      bsbState: optionsElm.bsbState.checked
    });
  }

  browser.storage.local.set({ tabs: enabledTabs });
}

/**
* Check settings for the tabs Map and
* checks popup controls accordingly
* @param {object} storedSettings
*/
function checkStoredSettings(storedSettings) {

  if (!currentTab) {
    throw "Cannot determine tab id while retrieving settings!";
  }

  enabledTabs = storedSettings.tabs;

  if (enabledTabs && (enabledTabs instanceof Map) && enabledTabs.has(currentTab)) {
    optionsElm.state.checked = enabledTabs.get(currentTab).state;
    optionsElm.bsbState.checked = enabledTabs.get(currentTab).bsbState;
  }
}

/**
* Listen for clicks on the buttons, and send the 
* appropriate message to the content script in the page.
*/
function listenForClicks() {
  document.addEventListener("click", (e) => {
    storeSettings();
    if (e.target.id == 'ruler-state') {
      toggleRuler(e.target.checked);
    } else if (e.target.id == 'bsb-state') {
      toggleBreakpoints(e.target.checked);
    } else if (e.target.id == 'open-options') {
      e.preventDefault();
      browser.runtime.openOptionsPage();
    }
  });
}

/**
* Initialize popup retrieving current tab id
* and start listening for popup interactions
*/
(function initPopup() {
  optionsElm.state = document.getElementById('ruler-state');
  optionsElm.bsbState = document.getElementById('bsb-state');

  const gettingTab = browser.tabs.query({active: true, currentWindow: true});
  gettingTab.then(function(tabs) { 
    currentTab = tabs[0].id 
  }).catch(onError);

  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(checkStoredSettings).catch(onError);
  
  listenForClicks();
})();

