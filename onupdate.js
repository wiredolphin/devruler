/**
* Main logic: initializes DevRuler extension on page load.
* Author: vince damiani 2019;
*/

/**
* There was an error executing the script.
* Display the popup's error message, and hide the normal UI.
* @param {string} error
*/
function reportExecuteScriptError(error) {
  // document.querySelector("#popup-content").classList.add("hidden");
  // document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute DevRuler content script: ${error.message}`);
}

/**
* Just log the error to the console.
* @param {string} error
*/
function onError(error) {
  console.error(`Could not show DevRuler: ${error}`);
}

/**
* Inject proper CSS and sends the appropriate command to
* the receiver instanciated by the `devruler.js` script.
* @param {object} tab involved, from storage settings
* @param {string} id of the tab
*/
function updateOnLoad(tab, id) {
  if (tab.state) {
    browser.tabs.insertCSS({file: '/css/ruler.css'}).then(() => {
      browser.tabs.sendMessage(id, {
        command: "showRuler"
      }).catch(onError);
    });
  } else {
    browser.tabs.removeCSS({file: '/css/ruler.css'}).then(() => {
      browser.tabs.sendMessage(id, {
        command: "resetRuler",
      }).catch(onError);
    });
  }
  if (tab.bsbState) {
    browser.tabs.insertCSS({file: '/css/breakpoints.css'}).then(() => {
      browser.tabs.sendMessage(id, {
        command: "showBreakpoints"
      }).catch(onError);
    });
  } else {
    browser.tabs.removeCSS({file: '/css/breakpoints.css'}).then(() => {
      browser.tabs.sendMessage(id, {
        command: "resetBreakpoints",
      }).catch(onError);
    });
  }
  if (tab.state || tab.bsbState) {
    browser.tabs.sendMessage(id, {
      command: "updateStyles",
    }).catch(onError);
  }
}

/**
* Removes closed tabs from settings.
* @param {object} settings
*/
function resetSettingsTabs(settings) {
  browser.tabs.query({})
    .then(function(tabs){
      settings.tabs.forEach(function(v, k) {
        if (tabs.find(function(elm){ return elm.id == k }) == undefined) {
          settings.tabs.delete(k);
        }
      });
      browser.storage.local.set({ tabs: settings.tabs });
    });
}

/**
* Initialize DevRuler at page load time (status = 'complete'),
* executing `devruler.js` script which is responsable to
* instanciate the command receiver.
* @param {string} id of the current tab
* @param {object} info of the current tab
* @param {object} current tab
*/
function initializeRuler(id, info, tab) {
  if (info.status == "complete") {
    browser.tabs.executeScript({file: "/content_scripts/devruler.js"})
      .then(function() {
        const gettingStoredSettings = browser.storage.local.get();
        gettingStoredSettings.then(function(settings) {
          resetSettingsTabs(settings);
          if (settings.tabs && (settings.tabs instanceof Map)) {
            if (settings.tabs.has(id)) {
              updateOnLoad(settings.tabs.get(id), id);
            }
          } else {
            browser.storage.local.set({ tabs: new Map() });
          }
        }).catch(onError);
      }).catch(reportExecuteScriptError)
  }
}

browser.tabs.onUpdated.addListener(initializeRuler);




















