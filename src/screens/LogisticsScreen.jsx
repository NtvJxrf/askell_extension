import React, { useState } from "react";
import { Button, Typography, Form, Input, DatePicker, Select, InputNumber, TimePicker, Space, message, notification } from "antd";
const { Title } = Typography;
const { Option } = Select;

export default function LogisticsScreen({ onBack, data }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const handleFinish = async (values) => {
    const targetDate = values.targetDate.format("DD.MM.YYYY");
    const dataFromForm = {
      ...values,
      id: data.documentId,
      requestFrom: data.user.login,
      targetDate,
    };
    chrome.runtime.sendMessage({ action: "logisticRequest", data: { dataFromForm, user: data.user}}, (response) => {
      console.log(response)
      messageApi.open({
        type: "success",
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
      <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>Заявка логисту</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          deliveryDays: 1,
        }}
      >
        <Form.Item
          label="Количество дней на доставку"
          name="deliveryDays"
          rules={[{ required: true, message: "Введите количество дней" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Дата доставки"
          name="targetDate"
          rules={[{ required: true, message: "Выберите дату" }]}
        >
          <DatePicker style={{ width: "100%" }} placement="bottomLeft" size="small"/>
        </Form.Item>

        <Form.Item
          label="Позиции (номер-количество через запятую)"
          name="positions"
          extra={
            <>
              Если поле пустое — будут посчитаны все позиции.<br />
              Для определенных позиций указать их через запятую (1,3,4,7)<br />
              Для определенных позиций и количества указать их через запятую в формате "номер-количество" (1-2,4-5)
            </>
          }
        >
          <Input placeholder="Например: 1-2,3-1" />
        </Form.Item>

        <Form.Item
          label="Доступные часы"
          name="availableHours"
        >
          <Input placeholder="Например: 09:00-18:00" />
        </Form.Item>

        <Form.Item
          label="Обед"
          name="lunchBreak"
        >
          <Input placeholder="Например: 13:00-14:00" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Отправить заявку
            </Button>
            <Button onClick={() => form.resetFields()}>Очистить</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
