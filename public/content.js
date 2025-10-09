if (!window.hasContentListener) {
  window.hasContentListener = true;
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getLocalStorage") {
      const value = localStorage.getItem(msg.key);
      sendResponse(value);
    }
    return true;
  });
}
