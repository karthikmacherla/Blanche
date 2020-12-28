const MODAL_VIEW = "views/html/modal.html";
const MODAL_ID = "sp-modal-search-container";
const MODAL_CLASS = "sp-modal-search-class";

//content.js
chrome.runtime.onMessage.addListener((request) => {
  if (modalExists()) {
    destroyModal();
  } else {
    createModal();
  }
});

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


function modalExists() {
  return document.getElementById(MODAL_ID);
}