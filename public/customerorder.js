(() => {
  if (window.__customerorder_injected) {
    console.log("⚡ customerorder.js already initialized");
    return;
  }
  window.__customerorder_injected = true;

  let attributes = [];

  // === Загрузка списка полей из стора ===
  async function getAttributes() {
    return new Promise((resolve) => {
      chrome.storage.local.get("attributesList", (result) => {
        if (Array.isArray(result.attributesList) && result.attributesList.length > 0) {
          resolve(result.attributesList);
        } else {
          resolve(["Вид доставки"]);
        }
      });
    });
  }

  // === Ждём появления .attributes-list внутри data-payload="CustomerOrder" ===
  function waitForCustomerOrderAttributesList(callback) {
    const findContainer = () =>
      document.querySelector('[data-payload="CustomerOrder"] .attributes-list');

    const container = findContainer();
    if (container) return callback(container);

    const observer = new MutationObserver(() => {
      const container = findContainer();
      if (container) {
        observer.disconnect();
        callback(container);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  async function getOutlineColor() {
    return new Promise((resolve) => {
      chrome.storage.local.get("outlineColor", (result) => {
        resolve(result.outlineColor || "orange");
      });
    });
  }

  // === Основная подсветка ===
  async function observeAttributesList(container) {
    attributes = await getAttributes();
    const labelArray = Array.from(container.querySelectorAll("span.Q\\+YVt"));
    if (!labelArray.length) return;

    const color = await getOutlineColor();

    for (const label of labelArray) {
      if (!attributes.includes(label.innerText)) continue;

      const fieldWrapper = label.closest(".Ni4c2.field-name");
      const wrapper = fieldWrapper?.nextElementSibling;
      const input = wrapper?.querySelector("input");

      if (!wrapper || !input) continue;

      const updateStyle = () => {
        if (!input.value.trim()) {
          wrapper.style.outline = `1.5px solid ${color}`;
          wrapper.style.borderColor = color;
        } else {
          wrapper.style.outline = "";
          wrapper.style.borderColor = "";
        }
      };

      updateStyle();

      const inputObserver = new MutationObserver(updateStyle);
      inputObserver.observe(input, { attributes: true, attributeFilter: ["value"] });
    }
  }

  // Запуск ожидания нужного контейнера
  waitForCustomerOrderAttributesList((container) => observeAttributesList(container));

  // === Реакция на изменения настроек ===
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== "local") return;

    if (changes.outlineColor || changes.attributesList) {
      const newColor = (changes.outlineColor && changes.outlineColor.newValue) || (await getOutlineColor());
      if (changes.attributesList) {
        attributes = changes.attributesList.newValue || attributes;
      }

      document
        .querySelectorAll('[data-payload="CustomerOrder"] .Ni4c2.field-name')
        .forEach((fieldWrapper) => {
          const label = fieldWrapper.querySelector("span.Q\\+YVt");
          if (!label || !attributes.includes(label.innerText)) return;

          const wrapper = fieldWrapper.nextElementSibling;
          const input = wrapper?.querySelector("input");
          if (!wrapper || !input) return;

          if (!input.value.trim()) {
            wrapper.style.outline = `1.5px solid ${newColor}`;
            wrapper.style.borderColor = newColor;
          } else {
            wrapper.style.outline = "";
            wrapper.style.borderColor = "";
          }
        });
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === "PING_CUSTOMERORDER") {
      sendResponse({ ok: true });
    }
  });

  console.log("✅ customerorder.js initialized (scopes to data-payload=CustomerOrder)");
})();
