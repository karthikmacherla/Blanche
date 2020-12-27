const modalView = "views/html/modal.html";

//content.js
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'spotlight-search-msg') {
    createModal();
  } else if (request.type == "spotlight-search-close-msg") {
    destroyModal();
  }
});

/**
 * Creates the spotlight search modal
 * @relevant "modal-container" is the id of the popup
 */
function createModal() {
  // Styling the container holding the iframe itself
  const modal = document.createElement("div");
  modal.setAttribute(
    "style", `
      padding: 7px;
      margin: initial;
      height:100px;
      left: 25%;
      right: 25%;
      border: none;
      top:10%;
      -webkit-border-radius:7px;
      background-color:white;
      position: fixed; 
      box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
    `
  );
  /* TODO: Figure out how to fill the div completely */
  modal.setAttribute("id", "modal-container");
  modal.innerHTML = `<iframe id="popup-content"; 
    style="
      height:100%;
      width: 100%;
      "></iframe>`;
  //add everything to the screen
  document.body.appendChild(modal);
  const iframe = document.getElementById("popup-content");
  iframe.src = chrome.runtime.getURL(modalView);
  iframe.frameBorder = 0;

  /* TODO: Focus search bar on open */
  var searchBar = iframe.contentWindow.document.getElementById("search-bar");

  iframe.contentWindow.focus();
  searchBar.focus();
}

/**
 * Destroys the spotlight search model if it exists
 * @relevant uses modal-container as the id
 */
function destroyModal() {
  console.log("Destroying modal");

  let elem = document.getElementById("modal-container");
  elem.remove();
}