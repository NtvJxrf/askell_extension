import React, { useState } from "react";
import { Button, Typography, Form, Input, Checkbox, Select, InputNumber, Space, message } from "antd";
const { Title } = Typography;
const { Option } = Select;

export default function LogisticsScreen({ onBack, data }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [disabled, setDisabled] = useState(false)
  const handleFinish = async (values) => {
    setDisabled(true)
    const dataFromForm = {
      ...values,
      id: data.documentId,
    };
    chrome.runtime.sendMessage({ action: "reclamationRequest", data: { dataFromForm, user: data.user}}, (response) => {
      setDisabled(false)
      messageApi.open({
        type: 'info',
        content: (
          <>
            {response.message}
            <br />
            <a href={response.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1677ff" }}>
              Открыть страницу →
            </a>
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
      <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>Создать рекламацию</Title>

      <Form
        form={form}
        layout="vertical"
        size="small"
        onFinish={handleFinish}
        style={{ margin: '0 auto', marginTop: 30 }}
      >
        <Form.Item
          label="Скопировать доп. поля"
          name="copyAttrs"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>

        <Form.Item
          label="Скопировать комментарий"
          name="copyDescription"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>

        <Form.Item
          label="Позиции (номер-количество через запятую)"
          name="positions"
          extra={
            <>
              Если поле пустое — будут посчитаны все позиции.<br />
              Для определенных позиций — указать их через запятую (1,3,4,7)<br />
              Для определенных позиций и количества — указать их через запятую в формате "номер-количество" (1-2,4-5)
            </>
          }
        >
          <Input placeholder="Например: 1-2,3-1" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" disabled={disabled}>
              Создать
            </Button>
            <Button onClick={() => form.resetFields()}>Очистить</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
