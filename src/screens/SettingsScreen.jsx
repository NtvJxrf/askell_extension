import React, { useState, useEffect } from "react";
import { Button, ColorPicker, Space, Typography, Checkbox, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function SettingsScreen({ onBack }) {
  const [color, setColor] = useState("#ffa500");
  const [highlightCustomerOrderFields, setHighlightRequired] = useState(true);
  const [attributesList, setAttributesList] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(
      ["outlineColor", "highlightCustomerOrderFields", "attributesList"],
      (result) => {
        if (result.outlineColor) setColor(result.outlineColor);
        if (typeof result.highlightCustomerOrderFields === "boolean")
          setHighlightRequired(result.highlightCustomerOrderFields);
        if (Array.isArray(result.attributesList))
          setAttributesList(result.attributesList);
      }
    );
  }, []);

  const saveAttributes = (list) => {
    setAttributesList(list);
    chrome.storage.local.set({ attributesList: list });
  };

  const handleChangeAttributes = (value) => {
    saveAttributes(value);
  };

  const handleChangeColor = (value) => {
    const hex = typeof value === "string" ? value : value.toHexString();
    setColor(hex);
    chrome.storage.local.set({ outlineColor: hex });
  };

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

        <div style={{ width: "100%" }}>
          <Space style={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={5} style={{ margin: 0 }}>Названия доп. полей для подсветки</Title>
          </Space>

          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="Добавьте обязательные поля"
            value={attributesList}
            onChange={handleChangeAttributes}
          />
        </div>
      </Space>
    </div>
  );
}
