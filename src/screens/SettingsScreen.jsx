import React, { useState, useEffect } from "react";
import { Button, ColorPicker } from "antd";


export default function SettingsScreen({ onBack }) {

  const [color, setColor] = useState("#ffa500"); // по умолчанию orange

  useEffect(() => {
    chrome.storage.local.get("outlineColor", (result) => {
      if (result.outlineColor) setColor(result.outlineColor);
    });
  }, []);

  const handleChange = (value) => {
    const hex = typeof value === "string" ? value : value.toHexString();
    setColor(hex);
    chrome.storage.local.set({ outlineColor: hex });
  };

  return (
    <div style={{ padding: 20 }}>
      <Button onClick={onBack}>← Назад</Button>
      <h3>Выберите цвет рамки:</h3>
      <ColorPicker value={color} onChange={handleChange} />
    </div>
  );
}