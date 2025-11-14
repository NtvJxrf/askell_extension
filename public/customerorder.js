(() => {
  if (window.__customerorder_injected) {
    console.log("⚡ customerorder.js already initialized");
    return;
  }
  window.__customerorder_injected = true;

  let attributes = [];

  async function getAttributes() {
    return new Promise((resolve) => {
      chrome.storage.local.get("attributesList", (result) => {
        resolve(Array.isArray(result.attributesList) ? result.attributesList : []);
      });
    });
  }

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

  function getInputElement(fieldWrapper) {
    const dateInput = fieldWrapper.nextElementSibling?.querySelector("input.input-rdDkOR");
    if (dateInput) {
      return {
        wrapper: fieldWrapper.nextElementSibling.querySelector(".wrapper-BF08q1"),
        input: dateInput
      };
    }

    const selectorWrapper = fieldWrapper.nextElementSibling?.querySelector(".inputWrapper-KGf69w");
    if (selectorWrapper) {
      return {
        wrapper: selectorWrapper,
        input: selectorWrapper.querySelector("input.input-_iScnU")
      };
    }

    const simpleInput = fieldWrapper.nextElementSibling?.querySelector("input.input-Fe7P3R, input.input-tWkblY");
    if (simpleInput) {
      return {
        wrapper: simpleInput,
        input: simpleInput
      };
    }

    return null;
  }

  async function observeAttributesList(container) {
    attributes = await getAttributes();
    const labels = Array.from(container.querySelectorAll("span.formItemLabel-XuTXi8"));

    if (!labels.length) return;

    const color = await getOutlineColor();

    for (const label of labels) {
      if (!attributes.includes(label.innerText)) continue;

      const fieldWrapper = label.closest(".formItemTitle-ocRg5X.field-name");
      if (!fieldWrapper) continue;

      const { wrapper, input } = getInputElement(fieldWrapper) || {};
      if (!wrapper || !input) continue;

      const applyStyle = () => {
        if (!input.value.trim()) {
          wrapper.style.outline = `1.5px solid ${color}`;
          wrapper.style.borderColor = color;
        } else {
          wrapper.style.outline = "";
          wrapper.style.borderColor = "";
        }
      };

      applyStyle();

      const obs = new MutationObserver(applyStyle);
      obs.observe(input, { attributes: true, attributeFilter: ["value"] });
    }
  }

  waitForCustomerOrderAttributesList((container) => observeAttributesList(container));

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== "local") return;

    if (changes.attributesList || changes.outlineColor) {
      const newColor =
        (changes.outlineColor && changes.outlineColor.newValue) || (await getOutlineColor());

      if (changes.attributesList) {
        attributes = changes.attributesList.newValue;
      }

      document
        .querySelectorAll('[data-payload="CustomerOrder"] .formItemTitle-ocRg5X.field-name')
        .forEach((fieldWrapper) => {
          const label = fieldWrapper.querySelector("span.formItemLabel-XuTXi8");
          if (!label || !attributes.includes(label.innerText)) return;

          const item = getInputElement(fieldWrapper);
          if (!item) return;

          const { wrapper, input } = item;

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
    if (msg?.type === "PING_CUSTOMERORDER") {
      sendResponse({ ok: true });
    }
  });

  console.log("✅ customerorder.js initialized (new class selectors applied)");
})();
