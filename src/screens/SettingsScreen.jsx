import React, { useState, useEffect } from "react";
import { Button, ColorPicker, Space, Typography, Checkbox } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function SettingsScreen({ onBack }) {
  const [color, setColor] = useState("#ffa500");
  const [highlightCustomerOrderFields, setHighlightRequired] = useState(true);

  // Загружаем настройки из chrome.storage
  useEffect(() => {
    chrome.storage.local.get(["outlineColor", "highlightCustomerOrderFields"], (result) => {
      if (result.outlineColor) setColor(result.outlineColor);
      if (typeof result.highlightCustomerOrderFields === "boolean")
        setHighlightRequired(result.highlightCustomerOrderFields);
    });
  }, []);

  // Обновление цвета
  const handleChangeColor = (value) => {
    const hex = typeof value === "string" ? value : value.toHexString();
    setColor(hex);
    chrome.storage.local.set({ outlineColor: hex });
  };

  // Обновление чекбокса
  const handleChangeHighlight = (e) => {
    const checked = e.target.checked;
    setHighlightRequired(checked);
    chrome.storage.local.set({ highlightCustomerOrderFields: checked });
  };

  return (
    <div style={{ padding: 20 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ display: "flex", alignItems: "center" }}
        >
          Назад
        </Button>

        <Space align="center" size="small">
          <Title level={5} style={{ margin: 0 }}>
            Цвет рамки:
          </Title>
          <ColorPicker value={color} onChange={handleChangeColor} format="hex" />
        </Space>

        <Space align="center" size="small">
          <Checkbox checked={highlightCustomerOrderFields} onChange={handleChangeHighlight}>
            <Title level={5} style={{ margin: 0, display: "inline-block" }}>
              Подсвечивать обязательные поля в заказе покупателя
            </Title>
          </Checkbox>
        </Space>
      </Space>
    </div>
  );
}
