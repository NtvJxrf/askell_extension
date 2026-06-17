import React, { useState } from "react";
import { Button, Typography, Form, Space, message, ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import 'dayjs/locale/ru';
dayjs.locale("ru");
const { Title } = Typography;
export default function CustomerLabels({ onBack, data }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [disabled, setDisabled] = useState(false)
  const handleFinish = async (values) => {
    setDisabled(true)
    const dataFromForm = {
      ...values,
      id: data.documentId,
      requestFrom: data.user.login,
    };
    chrome.runtime.sendMessage({ action: "customerlabels", data: { dataFromForm, user: data.user}}, (response) => {
      setDisabled(false)
      messageApi.open({
        type: 'info',
        content: (
          <>
            {response.message || 'Этикетки готовы'}
          </>
        ),
        duration: 6,
      });
    });
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      {contextHolder}
      <Button onClick={onBack} style={{ marginBottom: 20 }}>← Назад</Button>
      <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>Этикетки на готовые изделия</Title>
      <ConfigProvider locale={ruRU}>
        <Form
          form={form}
          layout="vertical"
          size="small"
          onFinish={handleFinish}
        >
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" disabled={disabled}>
                Создать этикетки
              </Button>
              <Button onClick={() => form.resetFields()}>Очистить</Button>
            </Space>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </div>
  );
}
