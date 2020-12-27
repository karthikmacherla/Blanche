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
 */
function createModal() {
  const modal = document.createElement("div");
  modal.setAttribute(
    "style", `
      height:100px;
      left: 25%;
      right: 25%;
      border: none;
      top:10%;
      border-radius:7px;
      background-color:white;
      position: fixed; 
      box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
    `
  );
  modal.setAttribute("id", "modal-container");
  modal.innerHTML = `<iframe id="popup-content"; style="height:100%"></iframe>`;
  document.body.appendChild(modal);
  const iframe = document.getElementById("popup-content");
  iframe.src = chrome.runtime.getURL(modalView);
  iframe.frameBorder = 0;
}

/**
 * Destroys the spotlight search model if it exists
 */
function destroyModal() {
  console.log("Destroying modal");

  let elem = document.getElementById("modal-container");
  elem.remove();
}