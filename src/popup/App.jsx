import React, { useEffect, useState } from "react";
import { Button, Space, Typography, Divider } from "antd";
import { FileTextOutlined, ShoppingOutlined, InboxOutlined, TruckOutlined, ExclamationCircleOutlined, MehOutlined, SettingOutlined } from "@ant-design/icons";
import ReclamationScreen from '../screens/ReclamationScreen';
import LogisticsScreen from '../screens/LogisticsScreen';
import SettingsScreen from "../screens/SettingsScreen";
const { Title, Text } = Typography;

export default function App() {
  const [pageType, setPageType] = useState(null);
  const [user, setUser] = useState(null)
  const [screen, setScreen] = useState("main");
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      const url = tab?.url || "";
      if (url.includes("customerorder/edit")) setPageType("customerorder/edit");
      else if (url.includes("invoiceout/edit")) setPageType("invoiceout/edit");
      else setPageType("unknown");

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      chrome.tabs.sendMessage(tab.id, { action: "getLocalStorage", key: "HDE_VISITOR_DATA[online.moysklad.ru]" }, (response) => {
        setUser(JSON.parse(response))
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

      case "invoiceout":
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button type="primary" icon={<FileTextOutlined />}>
              Печать счета
            </Button>
            <Button icon={<ShoppingOutlined />}>Отправить клиенту</Button>
          </Space>
        );
      default:
        return <Text type="secondary">На этой странице для вас ничго нет <MehOutlined /> </Text>;
    }
  };
  return (
    <div style={{ padding: 16, width: 400}}>
      {screen === "main" && (
        <Button type="text" icon={<SettingOutlined />} onClick={() => setScreen("settings")}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#555",
          }}
        />
      )}
      {screen === "main" && renderActions()}
      {screen === "reclamation" && <ReclamationScreen onBack={() => setScreen("main")} />}
      {screen === "logistics" && <LogisticsScreen onBack={() => setScreen("main")} />}
      {screen === "settings" && <SettingsScreen onBack={() => setScreen("main")} />}
    </div>
  );
}
