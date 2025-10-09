import React from "react";
import { Button, Typography } from "antd";
const { Title, Text } = Typography;

export default function SettingsScreen({ onBack }) {
  return (
    <div>
      <Button onClick={onBack}>← Назад</Button>
      <Title level={5}>Настройки</Title>
      <Text>Здесь будут настройки...</Text>
    </div>
  );
}