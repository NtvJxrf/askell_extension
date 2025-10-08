// Функция для проверки URL
function checkUrl(tab) {
  if (tab.url && tab.url.includes("customerorder")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["customerorder.js"]
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
