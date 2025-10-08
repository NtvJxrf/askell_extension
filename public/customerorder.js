(() => {
  function observeContainer() {
    const observer = new MutationObserver((mutations, obs) => {
      const container = document.querySelector(".IXFIY");
      if (container) {
        createActionsDropdown(container);
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  const createActionsDropdown = (container) => {
    if (document.getElementById("askellActionsDropdown")) return;
    // Dropdown
    const dropdownWrapper = document.createElement("button");
    dropdownWrapper.className = 'P+ae0 Xk4gG ve4Lx GIWXp';
    dropdownWrapper.style.position = "relative";
    dropdownWrapper.id = "askellActionsDropdown";

    const btnText = document.createElement("div");
    btnText.className = 'CzjRh U6fI5'; 
    btnText.innerText = 'Доп. действия';

    const dddiv = document.createElement("div");
    dddiv.className = 'A8vlB Jr8QP'; 
    dddiv.setAttribute("data-test-id", "dropdown-btn");

    const ddicon = document.createElement("div");
    ddicon.className = 'SE3oT'; 
    dddiv.appendChild(ddicon);

    const list = document.createElement("ul");
    list.style.position = "absolute";
    list.style.top = "100%";
    list.style.left = "0";
    list.style.background = "#fff";
    list.style.border = "1px solid #ccc";
    list.style.padding = "0";
    list.style.margin = "0";
    list.style.listStyle = "none";
    list.style.display = "none";
    list.style.zIndex = "1000";
    list.style.minWidth = dropdownWrapper.offsetWidth + "px";
    list.style.width = "max-content";

    const options = [
      { text: "Оформить рекламацию", action: () => openReclamationModal( (val) => console.log("Рекламация:", val)) },
      { text: "Создать заявку логисту", action: () => openLogisticModal( (val) => console.log("Логистика", val)) },
    ];

    options.forEach(opt => {
      const li = document.createElement("li");
      li.textContent = opt.text;
      li.style.padding = "5px 10px";
      li.style.cursor = "pointer";

      li.addEventListener("click", () => {
        opt.action();
        list.style.display = "none";
      });

      li.addEventListener("mouseover", () => li.style.background = "#eee");
      li.addEventListener("mouseout", () => li.style.background = "#fff");

      list.appendChild(li);
    });

    dropdownWrapper.addEventListener("click", (e) => {
      list.style.display = list.style.display === "none" ? "block" : "none";
      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      list.style.display = "none";
    });

    dropdownWrapper.appendChild(list);
    dropdownWrapper.appendChild(btnText);
    dropdownWrapper.appendChild(dddiv);
    container.appendChild(dropdownWrapper);
  };

  const openReclamationModal = (onSubmit) => {
    if (document.getElementById("askellModal")) return;

    // Оверлей
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "askellModal";
    Object.assign(modalOverlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "2000",
    });

    // Контент модалки
    const modalContent = document.createElement("div");
    Object.assign(modalContent.style, {
      background: "#fff",
      padding: "25px 30px",
      borderRadius: "12px",
      minWidth: "320px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    });

    // Заголовок
    const modalTitle = document.createElement("h3");
    modalTitle.innerText = 'Оформить рекламацию';
    Object.assign(modalTitle.style, {
      margin: "0 0 10px 0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
    });

    // Подпись к input
    const label = document.createElement("label");
    label.innerText = "Позиции и количество";
    Object.assign(label.style, {
      fontSize: "14px",
      color: "#555",
    });

    // Input
    const input = document.createElement("input");
    input.type = "text";
    Object.assign(input.style, {
      width: "100%",
      padding: "8px 10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px",
      outline: "none",
      transition: "0.2s",
    });
    input.addEventListener("focus", () => input.style.borderColor = "#4a90e2");
    input.addEventListener("blur", () => input.style.borderColor = "#ccc");

    // Кнопки
    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "10px",
    });

    const submitBtn = document.createElement("button");
    submitBtn.innerText = "Отправить";
    Object.assign(submitBtn.style, {
      padding: "8px 16px",
      background: "#4a90e2",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "0.2s",
    });
    submitBtn.addEventListener("mouseover", () => submitBtn.style.background = "#357ABD");
    submitBtn.addEventListener("mouseout", () => submitBtn.style.background = "#4a90e2");

    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Отмена";
    Object.assign(cancelBtn.style, {
      padding: "8px 16px",
      background: "#f0f0f0",
      color: "#333",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "0.2s",
    });
    cancelBtn.addEventListener("mouseover", () => cancelBtn.style.background = "#e0e0e0");
    cancelBtn.addEventListener("mouseout", () => cancelBtn.style.background = "#f0f0f0");

    submitBtn.addEventListener("click", () => {
      onSubmit(input.value);
      document.body.removeChild(modalOverlay);
    });
    cancelBtn.addEventListener("click", () => document.body.removeChild(modalOverlay));

    // Сборка
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(label);
    modalContent.appendChild(input);
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(submitBtn);
    modalContent.appendChild(buttonContainer);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    input.focus();
  };
  const openLogisticModal = (onSubmit) => {
    if (document.getElementById("askellModal")) return;

    // Оверлей
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "askellModal";
    Object.assign(modalOverlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "2000",
      backdropFilter: "blur(2px)",
    });

    // Контент модалки
    const modalContent = document.createElement("div");
    Object.assign(modalContent.style, {
      background: "#fff",
      padding: "25px 30px",
      borderRadius: "12px",
      minWidth: "320px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    });

    // Заголовок
    const modalTitle = document.createElement("h3");
    modalTitle.innerText = 'Создать заявку логисту';
    Object.assign(modalTitle.style, {
      margin: "0 0 10px 0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#333",
    });

    // Подпись к input
    const label = document.createElement("label");
    label.innerText = "Позиции и количество";
    Object.assign(label.style, {
      fontSize: "14px",
      color: "#555",
    });

    // Input
    const input = document.createElement("input");
    input.type = "text";
    Object.assign(input.style, {
      width: "100%",
      padding: "8px 10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px",
      outline: "none",
      transition: "0.2s",
    });
    input.addEventListener("focus", () => input.style.borderColor = "#4a90e2");
    input.addEventListener("blur", () => input.style.borderColor = "#ccc");

    // Кнопки
    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "10px",
    });

    const submitBtn = document.createElement("button");
    submitBtn.innerText = "Отправить";
    Object.assign(submitBtn.style, {
      padding: "8px 16px",
      background: "#4a90e2",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "0.2s",
    });
    submitBtn.addEventListener("mouseover", () => submitBtn.style.background = "#357ABD");
    submitBtn.addEventListener("mouseout", () => submitBtn.style.background = "#4a90e2");

    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Отмена";
    Object.assign(cancelBtn.style, {
      padding: "8px 16px",
      background: "#f0f0f0",
      color: "#333",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "0.2s",
    });
    cancelBtn.addEventListener("mouseover", () => cancelBtn.style.background = "#e0e0e0");
    cancelBtn.addEventListener("mouseout", () => cancelBtn.style.background = "#f0f0f0");

    submitBtn.addEventListener("click", () => {
      onSubmit(input.value);
      document.body.removeChild(modalOverlay);
    });
    cancelBtn.addEventListener("click", () => document.body.removeChild(modalOverlay));

    // Сборка
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(label);
    modalContent.appendChild(input);
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(submitBtn);
    modalContent.appendChild(buttonContainer);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    input.focus();
  };
  observeContainer();
})();
