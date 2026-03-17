import React, { useState } from "react";
import { Alert, Button, Space, Typography, message } from "antd";

const { Title, Text } = Typography;

export default function OptywayExportScreen({ onBack, data }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = () => {
    setDisabled(true);
    setError(null);

    const dataFromForm = {
      id: data.documentId,
      requestFrom: data.user?.login,
    };

    chrome.runtime.sendMessage(
      { action: "optywayExport", data: { dataFromForm, user: data.user } },
      (response) => {
        setDisabled(false);

        if (chrome.runtime.lastError) {
          const runtimeError = chrome.runtime.lastError.message;
          setError(runtimeError);
          return;
        }

        if (!response) {
          setError("Пустой ответ от сервера");
          return;
        }

        if (response.error) {
          setError(response.error);
          return;
        }

        messageApi.open({
          type: "success",
          content: response.message || "Файл готов к скачиванию",
          duration: 4,
        });
      }
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      {contextHolder}
      <Button onClick={onBack} style={{ marginBottom: 20 }}>← Назад</Button>
      <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>Экспорт для Optiway</Title>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space>
          <Button type="primary" onClick={handleExport} disabled={disabled}>
            Скачать файл
          </Button>
        </Space>

        {error && <Alert type="error" message={error} showIcon />}
      </Space>
    </div>
  );
}