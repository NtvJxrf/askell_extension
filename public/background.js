// background.js

// Проверка URL и запуск логики
async function checkUrl(tab) {
  if (!tab.url) return;
  if (tab.url.includes("customerorder")) {
    const { highlightCustomerOrderFields } = await chrome.storage.local.get("highlightCustomerOrderFields");
    if (highlightCustomerOrderFields) {
      await injectIfNeeded(tab.id);
    }
  }
}

// Пингуем контент-скрипт, если нет ответа — инжектим
async function injectIfNeeded(tabId) {
  chrome.tabs.sendMessage(tabId, { type: "PING_CUSTOMERORDER" }, async (resp) => {
    if (chrome.runtime.lastError || !resp) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ["customerorder.js"],
        });
        console.log("✅ customerorder.js injected into tab:", tabId);
      } catch (err) {
        console.error("❌ Inject failed:", err);
      }
    }
  });
}

// Активная вкладка изменилась
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await checkUrl(tab);
  } catch (err) {
    console.error("onActivated error:", err);
  }
});

// Вкладка обновилась (например, новый URL)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    checkUrl(tab);
  }
});

// Обработка внешнего сообщения для логистики
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
        sendResponse(data);
      } catch (err) {
        console.error("fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();
    return true; // async response
  }
  if (msg.action === "defectRequest") {
    (async () => {
      try {
        const res = await fetch("https://calc.askell.ru/api/extension/defectRequest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.data),
        });
        const data = await res.json();
        sendResponse(data);
      } catch (err) {
        console.error("fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();
    return true; // async response
  }
  if (msg.action === "moveRequest") {
    (async () => {
      try {
        const res = await fetch("https://calc.askell.ru/api/extension/createmove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.data),
        });
        const data = await res.json();
        sendResponse(data);
      } catch (err) {
        console.error("fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();
    return true; // async response
  }
  if (msg.action === "reclamationRequest") {
    (async () => {
      try {
        const res = await fetch("https://calc.askell.ru/api/extension/reclamationRequest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.data),
        });
        const data = await res.json();
        sendResponse(data);
      } catch (err) {
        console.error("fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();
    return true; // async response
  }
  if (msg.action === "createpzrequest") {
    (async () => {
      try {
        const res = await fetch("https://calc.askell.ru/api/extension/createpz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.data),
        });
        const data = await res.json();
        sendResponse(data);
      } catch (err) {
        console.error("fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();
    return true; // async response
  }
});
