// Функция для проверки URL
function checkUrl(tab) {
  if (tab.url && tab.url.includes("customerorder")) {
    chrome.storage.local.get("highlightCustomerOrderFields", (result) => {
      if (result.highlightCustomerOrderFields)
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["customerorder.js"]
        });
    });
  }
  
}
// Когда активная вкладка меняется
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  checkUrl(tab);
});

// Когда вкладка обновляется (например, переход на новый URL)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    checkUrl(tab);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "logisticRequest") {
    (async () => {
      try {
        const res = await fetch("https://calc.askell.ru/api/extension/logisticRequest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.data),
        });
        const data = await res.json();
        console.log("response from API:", data);
        sendResponse(data);
      } catch (err) {
        console.error("fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();
    return true;
  }
});
