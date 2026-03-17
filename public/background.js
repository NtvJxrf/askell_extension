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
  if (msg.action === 'productionlabels') {
    (async () => {
      try {
        const res = await fetch(
          'https://calc.askell.ru/api/extension/productionlabels',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg.data)
          }
        )

        if (!res.ok) {
          throw new Error('Ошибка генерации PDF')
        }
        console.log(res)
        const buffer = await res.arrayBuffer()

        function arrayBufferToBase64(buffer) {
          let binary = ''
          const bytes = new Uint8Array(buffer)
          const chunkSize = 0x8000

          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(
              ...bytes.subarray(i, i + chunkSize)
            )
          }

          return btoa(binary)
        }

        const base64 = arrayBufferToBase64(buffer)

        chrome.downloads.download({
          url: `data:application/pdf;base64,${base64}`,
          filename: 'labels.pdf',
          saveAs: true
        })

        sendResponse(true)
      } catch (err) {
        console.error('fetch error:', err)
        sendResponse({ error: err.message })
      }
    })()

    return true
  }

  if (msg.action === "optywayExport") {
    (async () => {
      try {
        const res = await fetch("https://calc.askell.ru/api/extension/optyway_export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.data),
        });

        if (!res.ok) {
          throw new Error(`Ошибка получения файла: ${res.status}`);
        }

        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "application/octet-stream";
        const contentDisposition = res.headers.get("content-disposition") || "";

        function arrayBufferToBase64(fileBuffer) {
          let binary = "";
          const bytes = new Uint8Array(fileBuffer);
          const chunkSize = 0x8000;

          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
          }

          return btoa(binary);
        }

        function getFilenameFromDisposition(disposition) {
          const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
          if (utf8Match?.[1]) {
            return decodeURIComponent(utf8Match[1]);
          }

          const basicMatch = disposition.match(/filename="?([^";]+)"?/i);
          if (basicMatch?.[1]) {
            return basicMatch[1];
          }

          return "optyway-export.xlsx";
        }

        const base64 = arrayBufferToBase64(buffer);
        const filename = getFilenameFromDisposition(contentDisposition);

        chrome.downloads.download({
          url: `data:${contentType};base64,${base64}`,
          filename,
          saveAs: true,
        });

        sendResponse({ message: "Файл готов к скачиванию" });
      } catch (err) {
        console.error("fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();

    return true;
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
