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
    } else if (msg.type == "openUrl") {
      createNewTab(msg);
    } else {
      sendTabInfo(port, msg);
    }
  });
});


function switchTabs(msg) {
  chrome.windows.update(msg.windowId, { focused: true }, function (win) {
    chrome.tabs.update(msg.tabId, { active: true });
  });
}

function createNewTab(msg) {
  chrome.tabs.create({ active: true, url: msg.url });
}

function sendTabInfo(port, msg) {
  chrome.tabs.query({}, (tabs) => {
    chrome.history.search({ text: "" }, (history) => {
      var tabRes = filterTabs(tabs, msg.query);
      var historyRes = filterHistory(history, msg.query);

      port.postMessage({ tabs: tabRes, history: historyRes });
    });
  })
}

/**
 * Filters tab results based on the query 
 * @param { [tabs] } tabs 
 * @param { string } query 
 */
function filterTabs(tabs, query) {
  if (query == "") {
    return tabs;
  }
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

/**
 * Filters history results based on the query
 * @param { [HistoryResult] } tabs 
 * @param { string } query 
 */
function filterHistory(historyRes, query) {
  if (query == "")
    return [];
  var res = [];
  query = query.toLowerCase();
  historyRes.forEach(history => {
    var title = history.title.toLowerCase();
    var url = history.url.toLowerCase();
    if (title.includes(query) || url.includes(query)) {
      res.push(history);
    }
  });
  return res;
}