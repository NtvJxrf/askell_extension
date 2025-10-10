if (!window.hasContentListener) {
  window.hasContentListener = true;
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getUser") {
      const el = document.querySelector("div.login-new");
      const login = el ? el.innerText.trim() : null;
      sendResponse({ login });
    }
    return true;
  });
}
