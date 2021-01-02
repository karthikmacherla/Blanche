/**
 * Status bar shortcut:
 * @Description Accepts a command and opens the status bar via message
 */
chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "spotlight-search-msg" });
  });
});

/**
 * Status bar shortcut:
 * @Description Accepts a command and opens the status bar via message
 */
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "spotlight-search-msg" });
  });
});


/**
 * Responses to requests for tab data
 * @relevant request looks like { initial: bool, query: string }
 */
chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name == "tab-info");
  port.onMessage.addListener(function (msg) {
    if (msg.type == "switch-tabs") {
      switchTabs(msg);
    } else {
      sendTabInfo(port, msg);
    }
  });
});


function switchTabs(msg) {
  chrome.tabs.update(msg.tabId, { active: true });
}

function sendTabInfo(port, msg) {
  chrome.tabs.getAllInWindow((tabs) => {
    var res;
    // Send all tab info
    if (msg.initial) {
      res = tabs;
    } else {
      res = filterTabs(tabs, msg.query);
    }
    port.postMessage({ tabs: res });
  })
}


function filterTabs(tabs, query) {
  var res = [];
  query = query.toLowerCase();
  tabs.forEach(tab => {
    var title = tab.title.toLowerCase();
    var url = tab.url.toLowerCase();
    if (title.includes(query) || url.includes(query)) {
      res.push(tab);
    }
  });

  return res;
}