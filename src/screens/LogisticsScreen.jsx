import React from "react";
import { Button, Typography } from "antd";
const { Title, Text } = Typography;

export default function LogisticsScreen({ onBack }) {
  return (
    <div>
      <Button onClick={onBack}>← Назад</Button>
      <Title level={5}>Заявка логисту</Title>
      <Text>Здесь будет форма для логистики...</Text>
    </div>
  );
}
