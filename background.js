/* Stores tabs where spotlight modal is open */
var openModals = {};

/**
 * Status bar shortcut:
 * @Description Accepts a command and opens the status bar via message
 */
chrome.commands.onCommand.addListener(function (command) {
  console.log('Command:', command);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    openModals[tabs[0].id] = openModals[tabs[0].id] ? false : true;
    if (openModals[tabs[0].id]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "spotlight-search-msg" });
    } else {
      chrome.tabs.sendMessage(tabs[0].id, { type: "spotlight-search-close-msg" });
    }
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