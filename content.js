const MODAL_VIEW = "templates/modal.html";
const DEFAULT_ICON_URL = "assets/box.svg";
const SEARCHBAR_CSS = "style/searchBar.css";
const SEARCHBAR_SCRIPT = "searchBar.js";
const MODAL_ID = "sp-modal-search-container";
const MODAL_CLASS = "sp-modal-search-class";
const SEARCHBAR_ID = "sp-search-bar";

var tabPort = chrome.runtime.connect({ name: "tab-info" });

/**
 * Message listener used to respond to cmd shortcuts. 
 * 
 * Opens the search bar when the right command is sent
 */
chrome.runtime.onMessage.addListener((request) => {
  if (request.type == "spotlight-search-msg")
    handleModal();
});

/**
 * Appropriately opens and closes modal based on presence on screen
 */
function handleModal() {
  if (modalExists()) {
    destroyModal();
  } else {
    createModal();
  }
}


/**
 * Checks if the modal exists
 */
function modalExists() {
  return document.getElementById(MODAL_ID);
}

/**
 * Create modal:
 * 1. Create div container + add to screen
 * 2. Get html contents from modal.html
 * 3. Make div a shadow. Add (2) to inner html
 * 4. put everything on the screen.
 */
function createModal() {
  var url = chrome.runtime.getURL(MODAL_VIEW);
  fetch(url)
    .then(response => {
      /* convert to text */
      return response.text();
    })
    .then(text => {
      // Convert the HTML string into a document object
      var parser = new DOMParser();
      var doc = parser.parseFromString(text, 'text/html');

      // Get the status bar element
      var statusBar = doc.getElementById('search-bar-complete');
      return statusBar;
    })
    .then(elem => {
      /* Get all style sheets/web resources and add them here */
      const searchBarCSS = document.createElement("link");
      searchBarCSS.setAttribute("rel", "stylesheet");
      searchBarCSS.setAttribute("href", chrome.runtime.getURL(SEARCHBAR_CSS));

      elem.prepend(searchBarCSS);

      const searchBarScript = document.createElement("script");
      searchBarScript.setAttribute("src", chrome.runtime.getURL(SEARCHBAR_SCRIPT));
      elem.append(searchBarScript);
      return elem;
    })
    .then(elem => {
      // create the shadow element and append the element to the screen
      const modal = document.createElement("div");
      modal.setAttribute("class", MODAL_CLASS);
      modal.setAttribute("id", MODAL_ID);
      var shadow = modal.attachShadow({ mode: 'open' });

      shadow.innerHTML = elem.innerHTML;
      document.body.appendChild(modal);

      //REMEMBER TO FOCUS SEARCH BAR AFTER APPENDING
      shadow.getElementById(SEARCHBAR_ID).focus();
    })
    .then(() => {
      registerSearchBarEvents();
      updateSearchResults();
    })
    .catch(err => {
      // handle error
      console.log("Error Fetching: " + err);
    });
}

/**
 * Destroys the spotlight search model if it exists
 * @relevant uses modal-container as the id
 */
function destroyModal() {
  console.log("Destroying modal");

  let elem = document.getElementById(MODAL_ID);
  elem.remove();
}

/**
 * Adds change listener to search bar to update search results
 */
function registerSearchBarEvents() {
  const searchContainer = document.getElementById(MODAL_ID).shadowRoot;
  var searchBar = searchContainer.getElementById(SEARCHBAR_ID);

  searchBar.addEventListener("input", (e) => {
    var query = searchBar.value;
    console.log("Search value: ", query);
    updateSearchResults(query);
  })

  searchContainer.addEventListener("keydown", (e) => {
    if (e.keyCode == 38) { // up arrow 
      tabSearchResultsUp();
    } else if (e.keyCode == 40) { // down arrow
      tabSearchResultsDown();
    } else if (e.keyCode == 13) { // enter key 
      doTabAction();
    }
  })
}

function tabSearchResultsUp() {
  const searchContainer = document.getElementById(MODAL_ID).shadowRoot;

  var curr = searchContainer.querySelector(".sp-selected");
  // Set the bottom to be the selected automatically
  if (curr == null) {
    var results = searchContainer.querySelectorAll(".search-result");

    if (results.length < 1)
      return;
    var last = results[results.length - 1];
    last.classList.add("sp-selected");
    return;
  }

  // we went over the top
  if (curr.previousElementSibling == null) {
    curr.classList.remove("sp-selected");

    var results = searchContainer.querySelectorAll(".search-result");

    if (results.length < 1)
      return;
    var last = results[results.length - 1];
    last.classList.add("sp-selected");
  } else {
    var prev = curr.previousElementSibling.previousElementSibling;
    curr.classList.remove("sp-selected");
    prev.classList.add("sp-selected");
  }
}

function tabSearchResultsDown() {
  const searchContainer = document.getElementById(MODAL_ID).shadowRoot;

  var curr = searchContainer.querySelector(".sp-selected");
  // Set the top to be the selected automatically
  if (curr == null) {
    var result = searchContainer.querySelector(".search-result");
    if (result == null)
      return;

    result.classList.add("sp-selected");
    return;
  }
  // we went too low
  if (curr.nextElementSibling == null) {
    curr.classList.remove("sp-selected");
    var result = searchContainer.querySelector(".search-result");
    if (result == null)
      return;
    result.classList.add("sp-selected");
  } else {
    var next = curr.nextElementSibling.nextElementSibling;
    curr.classList.remove("sp-selected");
    next.classList.add("sp-selected");
  }
}

function doTabAction() {
  /* 1. Robustness check: check to make sure entering on a selected element */
  console.log("User pressed enter");

  const container = getSearchContainer();
  var selectedTab = container.querySelector(".sp-selected");
  if (selectedTab == null) {
    return;
  }

  /* 2. Send a message to background to switch tabs or open new tab from history */

  var tabId = selectedTab.getAttribute("tabId");
  var windowId = selectedTab.getAttribute("windowId");
  if (tabId != null && parseInt(tabId)) {
    tabPort.postMessage({ type: "switch-tabs", tabId: parseInt(tabId), windowId: parseInt(windowId) })
    destroyModal();
    return;
  }

  var historyUrl = selectedTab.getAttribute("historyUrl");
  if (historyUrl != null) {
    tabPort.postMessage({ type: "openUrl", url: historyUrl });
    destroyModal();
    return;
  }

}

/**
 * Sends a message to start the chain of updating tab data
 */
function updateSearchResults(query = "") {
  tabPort.postMessage({ query: query });
}

/**
 * Receives response with tab data and renders to screen.
 */
tabPort.onMessage.addListener((msg) => {
  console.log(msg);

  // Clear the results container
  const container = getSearchContainer().getElementById("search-result-container");
  container.innerHTML = "";

  for (var i = 0; i < msg.tabs.length; i++) {
    var tab = msg.tabs[i];
    var searchResult = createSearchResult(i, tab, true);
    container.appendChild(searchResult);

    if (i != msg.tabs.length - 1 || msg.history.length != 0) {
      const hr = document.createElement("hr");
      container.appendChild(hr);
    }
  }

  for (var i = 0; i < msg.history.length; i++) {
    // cap off at 10 results 
    if (i + msg.tabs.length >= 10) {
      break;
    }

    var hist = msg.history[i];
    var searchResult = createSearchResult(i + msg.tabs.length, hist, false);
    container.appendChild(searchResult);

    if (i != msg.history.length - 1) {
      const hr = document.createElement("hr");
      container.appendChild(hr);
    }
  }

});

/**
 * Create DOM search result object from tab/history data
 * @param {*} resultNum : ith location in the search bar
 * @param {*} data : either tab data or history data
 * @param {*} isTab : boolean defining if either tab or history
 */
function createSearchResult(resultNum, data, isTab) {
  const searchResult = document.createElement("div");
  searchResult.classList.add("search-result");

  if (resultNum == 0) {
    searchResult.classList.add("sp-selected");
  }

  searchResult.setAttribute("tabindex", resultNum);
  if (isTab) {
    searchResult.setAttribute("tabId", data.id);
    searchResult.setAttribute("windowId", data.windowId);
  } else {
    searchResult.setAttribute("historyUrl", data.url);
  }
  const icon = document.createElement("img");
  if (data.favIconUrl)
    icon.setAttribute("src", data.favIconUrl);
  else {
    var url = chrome.runtime.getURL(DEFAULT_ICON_URL);
    icon.setAttribute("src", url);
  }

  const searchContent = document.createElement("div");
  searchContent.setAttribute("class", "search-results-content");

  var innerHtml = "<h6>" + data.title + "</h6>" + "<p>" + data.url + "</p>";
  if (!isTab) {
    innerHtml = "<h6> Open \"" + data.title + " in new tab </h6><p>" + data.url + "</p>";
  }

  searchContent.innerHTML = innerHtml;
  searchResult.appendChild(icon);
  searchResult.appendChild(searchContent);

  return searchResult;

}

function getSearchContainer() {
  return document.getElementById(MODAL_ID).shadowRoot;
}
