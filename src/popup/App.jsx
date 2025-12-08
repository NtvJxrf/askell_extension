import React, { useEffect, useState } from "react";
import { Button, Space, Typography, Divider } from "antd";
import { FileTextOutlined, ShoppingOutlined, UndoOutlined, TruckOutlined, ExclamationCircleOutlined, MehOutlined, SettingOutlined, ToolOutlined } from "@ant-design/icons";
import ReclamationScreen from '../screens/ReclamationScreen';
import LogisticsScreen from '../screens/LogisticsScreen';
import SettingsScreen from "../screens/SettingsScreen";
const { Title, Text } = Typography;

export default function App() {
  const [pageType, setPageType] = useState(null);
  const [user, setUser] = useState(null)
  const [screen, setScreen] = useState("main");
  const [documentId, setDocumentId] = useState(null);
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      const url = tab?.url || "";
      if (url.includes("customerorder/edit")) setPageType("customerorder/edit");
      else if (url.includes("invoiceout/edit")) setPageType("invoiceout/edit");
      else if (url.includes("internalorder/edit")) setPageType("internalorder/edit");
      else setPageType("unknown");

      try {
        const hash = url.split("#")[1] || "";
        const [path, queryString] = hash.split("?");
        const params = new URLSearchParams(queryString);
        const id = params.get("id");
        setDocumentId(id);
      } catch (e) {
        console.warn("Не удалось распарсить URL:", e);
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      chrome.tabs.sendMessage(tab.id, { action: "getUser" }, (response) => {
        setUser(response)
      });
    });
  }, []);

  const renderActions = () => {
    switch (pageType) {
      case "customerorder/edit":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button shape="round" icon={<ExclamationCircleOutlined />} onClick={() => setScreen("reclamation")}>Создать рекламацию</Button>
            <Button shape="round" icon={<TruckOutlined />} onClick={() => setScreen("logistics")}>Заявка логисту</Button>
          </Space>
        );

      case "invoiceout/edit":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button type="primary" icon={<FileTextOutlined />}>
              Печать счета
            </Button>
            <Button icon={<ShoppingOutlined />}>Отправить клиенту</Button>
          </Space>
        );

      case "internalorder/edit":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button shape="round" icon={<ToolOutlined />} onClick={() => chrome.runtime.sendMessage({ action: "createpzrequest", data: {dataFromForm: {user, id: documentId}}})}>
              Создать ПЗ
            </Button>
          </Space>
        );
      default:
        return <Text type="secondary">На этой странице для вас ничго нет <MehOutlined /> </Text>;
    }
  };
  return (
    <div style={{ padding: 16, position: "relative" }}>
      {screen === "main" && (
        <>
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              gap: 8,
            }}
          >
            <Button
              type="text"
              icon={<UndoOutlined />}
              onClick={() => chrome.runtime.reload()}
              style={{ color: "#555" }}
            />
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setScreen("settings")}
              style={{ color: "#555" }}
            />
          </div>

          {renderActions()}
        </>
      )}

      {screen === "reclamation" && (
        <ReclamationScreen onBack={() => setScreen("main")} data={{ user, documentId }}/>
      )}
      {screen === "logistics" && (
        <LogisticsScreen
          onBack={() => setScreen("main")}
          data={{ user, documentId }}
        />
      )}
      {screen === "settings" && <SettingsScreen onBack={() => setScreen("main")} />}
    </div>
  );
}
