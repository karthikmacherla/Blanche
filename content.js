const MODAL_VIEW = "templates/modal.html";
const SEARCHBAR_CSS = "style/searchBar.css";
const SEARCHBAR_SCRIPT = "searchBar.js";
const MODAL_ID = "sp-modal-search-container";
const MODAL_CLASS = "sp-modal-search-class";

var tabPort = chrome.runtime.connect({ name: "tab-info" });
tabPort.onMessage.addListener((msg) => {
  console.log("Recieved a message via the tab-info port\n", msg);
});

//content.js
chrome.runtime.onMessage.addListener((request) => {
  if (request.type == "spotlight-search-msg")
    handleModal();
});

//send message and bind a callback response
//long lived connections: post message, let addListener do work 

function handleModal() {
  if (modalExists()) {
    destroyModal();
  } else {
    createModal();
  }
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
      shadow.getElementById("sp-search-bar").focus();
    })
    .then(() => {
      addSearchResults();
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
 * Checks if the modal exists
 */
function modalExists() {
  return document.getElementById(MODAL_ID);
}


// load -> add all data
// typing -> clear and refresh with updated 
function addSearchResults() {
  // const searchContainer = document.getElementById(MODAL_ID).shadowRoot;

  // console.log("Search container:\n", searchContainer);
  // //getTabInfo();

  tabPort.postMessage({ tabs: "Get em now" });
}