import React from "react";
import { Button, Typography } from "antd";
const { Title, Text } = Typography;

export default function ReclamationScreen({ onBack }) {
  return (
    <div>
      <Button onClick={onBack}>← Назад</Button>
      <Title level={5}>Создание рекламации</Title>
      <Text>Здесь будет форма рекламации...</Text>
    </div>
  );
}