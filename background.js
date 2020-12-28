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