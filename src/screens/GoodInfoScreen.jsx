import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  InboxOutlined,
  LineChartOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import "./GoodInfoScreen.css";

const { Title, Text, Paragraph } = Typography;
const EXPANDED_POPUP_WIDTH = "800px";
const EXPANDED_POPUP_HEIGHT = "760px";

const formatNumber = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(Number(value));
};

const formatCurrency = (value) => `${formatNumber(value, 2)} RUB`;

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const normalizedValue = String(value).replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatMonth = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}-01T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);
};

const toAbsolute = (value) => Math.abs(Number(value) || 0);

export default function GoodInfoScreen({ onBack, data }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGoodInfo = () => {
    if (!data?.documentId) {
      setLoading(false);
      setError("Не удалось определить идентификатор товара из адреса страницы.");
      return;
    }

    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      {
        action: "goodInfoRequest",
        data: {
          dataFromForm: { id: data.documentId },
          user: data.user,
        },
      },
      (response) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message);
          setLoading(false);
          return;
        }

        if (!response) {
          setError("Сервер не вернул ответ по товару.");
          setLoading(false);
          return;
        }

        if (response.error) {
          setError(response.error);
          messageApi.error(response.error);
          setLoading(false);
          return;
        }

        setPayload(response);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    const previousHtmlWidth = html.style.width;
    const previousHtmlMinHeight = html.style.minHeight;
    const previousBodyWidth = body.style.width;
    const previousBodyMinWidth = body.style.minWidth;
    const previousBodyHeight = body.style.height;
    const previousBodyMinHeight = body.style.minHeight;
    const previousBodyMargin = body.style.margin;
    const previousRootWidth = root?.style.width;
    const previousRootMinHeight = root?.style.minHeight;

    html.style.width = EXPANDED_POPUP_WIDTH;
    html.style.minHeight = EXPANDED_POPUP_HEIGHT;
    body.style.width = EXPANDED_POPUP_WIDTH;
    body.style.minWidth = EXPANDED_POPUP_WIDTH;
    body.style.height = EXPANDED_POPUP_HEIGHT;
    body.style.minHeight = EXPANDED_POPUP_HEIGHT;
    body.style.margin = "0";

    if (root) {
      root.style.width = "100%";
      root.style.minHeight = "100%";
    }

    loadGoodInfo();

    return () => {
      html.style.width = previousHtmlWidth;
      html.style.minHeight = previousHtmlMinHeight;
      body.style.width = previousBodyWidth;
      body.style.minWidth = previousBodyMinWidth;
      body.style.height = previousBodyHeight;
      body.style.minHeight = previousBodyMinHeight;
      body.style.margin = previousBodyMargin;

      if (root) {
        root.style.width = previousRootWidth || "";
        root.style.minHeight = previousRootMinHeight || "";
      }
    };
  }, [data?.documentId]);

  const stocks = payload?.stocks || [];
  const lastSupplies = payload?.lastSupplies || [];
  const loss = payload?.loss || [];
  const unit = payload?.uom || "шт";

  const totalStock = stocks.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
  const totalReserve = stocks.reduce((sum, item) => sum + (Number(item.reserve) || 0), 0);
  const totalAvailable = stocks.reduce((sum, item) => sum + (Number(item.available) || 0), 0);
  const minimumStock = Number(payload?.minimumStock) || 0;
  const averageLossSum = toAbsolute(payload?.averageLoss?.averageSum);
  const averageLossQuantity = toAbsolute(payload?.averageLoss?.averageQuantity);
  const coverageMonths = averageLossQuantity > 0 ? totalAvailable / averageLossQuantity : null;
  const latestSupply = lastSupplies[0] || null;
  const minimumCoveragePercent = minimumStock > 0 ? Math.min((totalAvailable / minimumStock) * 100, 100) : 100;
  const shortageAmount = Math.max(minimumStock - totalAvailable, 0);

  let stockStatus = "success";
  let stockTagColor = "success";
  let stockTagText = "Запас в норме";

  if (minimumStock > 0 && totalAvailable < minimumStock) {
    stockStatus = "exception";
    stockTagColor = "error";
    stockTagText = "Ниже минимального остатка";
  } else if (minimumStock > 0 && totalAvailable < minimumStock * 1.25) {
    stockStatus = "active";
    stockTagColor = "warning";
    stockTagText = "Запас на границе";
  }

  const stockColumns = [
    {
      title: "Склад",
      dataIndex: "store",
      key: "store",
      width: 240,
      ellipsis: true,
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: `Остаток, ${unit}`,
      dataIndex: "stock",
      key: "stock",
      width: 120,
      align: "right",
      render: (value) => formatNumber(value, 3),
    },
    {
      title: `Резерв, ${unit}`,
      dataIndex: "reserve",
      key: "reserve",
      width: 120,
      align: "right",
      render: (value) => formatNumber(value, 3),
    },
    {
      title: `Доступно, ${unit}`,
      dataIndex: "available",
      key: "available",
      width: 120,
      align: "right",
      render: (value) => <Text strong>{formatNumber(value, 3)}</Text>,
    },
  ];

  const suppliesColumns = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      width: 170,
      render: (value) => formatDate(value),
    },
    {
      title: `Кол-во, ${unit}`,
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "right",
      render: (value) => formatNumber(value, 3),
    },
    {
      title: `Цена/${unit}`,
      dataIndex: "cost",
      key: "cost",
      width: 120,
      align: "right",
      render: (value) => formatCurrency(value),
    },
    {
      title: "Сумма",
      dataIndex: "sum",
      key: "sum",
      width: 130,
      align: "right",
      render: (value) => <Text strong>{formatCurrency(value)}</Text>,
    },
  ];

  const lossColumns = [
    {
      title: "Период",
      dataIndex: "month",
      key: "month",
      width: 130,
      render: (value) => formatMonth(value),
    },
    {
      title: "Опер.",
      dataIndex: "operationsCount",
      key: "operationsCount",
      width: 90,
      align: "right",
      render: (value) => formatNumber(value, 0),
    },
    {
      title: `Расход, ${unit}`,
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "right",
      render: (value) => formatNumber(toAbsolute(value), 3),
    },
    {
      title: "Сумма",
      dataIndex: "sum",
      key: "sum",
      width: 120,
      align: "right",
      render: (value) => formatCurrency(toAbsolute(value)),
    },
    {
      title: `Средний расход/${unit}`,
      dataIndex: "averageQuantity",
      key: "averageQuantity",
      width: 150,
      align: "right",
      render: (value) => formatNumber(toAbsolute(value), 3),
    },
    {
      title: "Средняя сумма",
      dataIndex: "averageSum",
      key: "averageSum",
      width: 140,
      align: "right",
      render: (value) => formatCurrency(toAbsolute(value)),
    },
  ];

  return (
    <div className="good-info-screen">
      {contextHolder}

      <div className="good-info-toolbar">
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Назад
        </Button>
        <Button icon={<ReloadOutlined />} onClick={loadGoodInfo} loading={loading}>
          Обновить
        </Button>
      </div>

      {loading ? (
        <Card className="good-info-section-card">
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : null}

      {!loading && error ? (
        <Alert
          type="error"
          showIcon
          message="Не удалось получить информацию о товаре"
          description={error}
        />
      ) : null}

      {!loading && !error && payload ? (
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <Card className="good-info-hero" bordered={false}>
            <div className="good-info-hero-content">
              <div>
                <Text className="good-info-overline">Карточка товара</Text>
                <Title level={3} className="good-info-hero-title">
                  {payload.message || "Информация о товаре"}
                </Title>
                <Paragraph className="good-info-hero-paragraph">
                  Остатки, последние поставки и динамика расхода в одном окне.
                </Paragraph>
              </div>

              <Space size={[8, 8]} wrap>
                <Tag color={stockTagColor}>{stockTagText}</Tag>
                <Tag color="processing">{stocks.length} складов</Tag>
                <Tag color="geekblue">{lastSupplies.length} последних поставок</Tag>
                <Tag color="purple">Ед. изм.: {unit}</Tag>
              </Space>

              <Descriptions className="good-info-descriptions" column={2} size="small">
                <Descriptions.Item label="Доступно сейчас">
                  {formatNumber(totalAvailable, 3)} {unit}
                </Descriptions.Item>
                <Descriptions.Item label="Минимальный остаток">
                  {formatNumber(minimumStock, 3)} {unit}
                </Descriptions.Item>
                <Descriptions.Item label="Средний расход в месяц">
                  {formatNumber(averageLossQuantity, 3)} {unit}
                </Descriptions.Item>
                <Descriptions.Item label="Покрытие запаса">
                  {coverageMonths ? `${formatNumber(coverageMonths, 1)} мес.` : "-"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>

          <Card className="good-info-section-card" bordered={false}>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              <div className="good-info-section-header">
                <Title level={4} style={{ margin: 0 }}>
                  Контроль остатка
                </Title>
                <Text type="secondary">
                  {minimumStock > 0
                    ? `Целевой минимум: ${formatNumber(minimumStock, 3)} ${unit}`
                    : "Минимальный остаток не задан"}
                </Text>
              </div>

              <Progress
                percent={Number(minimumCoveragePercent.toFixed(1))}
                status={stockStatus}
                strokeColor={stockStatus === "exception" ? "#cf1322" : stockStatus === "active" ? "#d48806" : "#237804"}
                format={() => minimumStock > 0
                  ? `${formatNumber(totalAvailable, 3)} / ${formatNumber(minimumStock, 3)} ${unit}`
                  : `${formatNumber(totalAvailable, 3)} ${unit}`}
              />

              {minimumStock > 0 ? (
                totalAvailable < minimumStock ? (
                  <Alert
                    type="warning"
                    showIcon
                    message={`Не хватает ${formatNumber(shortageAmount, 3)} ${unit} до минимального остатка.`}
                  />
                ) : (
                  <Alert
                    type="success"
                    showIcon
                    message={`Запас выше минимального на ${formatNumber(totalAvailable - minimumStock, 3)} ${unit}.`}
                  />
                )
              ) : null}
            </Space>
          </Card>
          <Card className="good-info-section-card" bordered={false}>
            <div className="good-info-section-header">
              <Title level={4} style={{ margin: 0 }}>
                Остатки по складам
              </Title>
              <Text type="secondary">Полная картина по наличию, резерву и доступному остатку</Text>
            </div>
            <Table
              columns={stockColumns}
              dataSource={stocks}
              pagination={false}
              size="small"
              rowKey={(record, index) => `${record.store}-${index}`}
              tableLayout="fixed"
              scroll={{ x: 600 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Итого</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>{formatNumber(totalStock, 3)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <Text strong>{formatNumber(totalReserve, 3)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text strong>{formatNumber(totalAvailable, 3)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>

          <Card className="good-info-section-card" bordered={false}>
            <div className="good-info-section-header">
              <Title level={4} style={{ margin: 0 }}>
                Последние поставки
              </Title>
              <Text type="secondary">
                {latestSupply
                  ? `Последняя поставка: ${formatDate(latestSupply.date)}`
                  : "Данные по поставкам отсутствуют"}
              </Text>
            </div>

            {lastSupplies.length ? (
              <Table
                columns={suppliesColumns}
                dataSource={lastSupplies}
                pagination={false}
                size="small"
                rowKey={(record, index) => `${record.date}-${index}`}
                tableLayout="fixed"
                scroll={{ x: 540 }}
              />
            ) : (
              <Empty description="Нет данных по последним поставкам" />
            )}
          </Card>

          <Card className="good-info-section-card" bordered={false}>
            <div className="good-info-section-header">
              <Title level={4} style={{ margin: 0 }}>
                Расход по месяцам
              </Title>
            </div>

            {loss.length ? (
              <Table
                columns={lossColumns}
                dataSource={loss}
                pagination={false}
                size="small"
                rowKey={(record, index) => `${record.month}-${index}`}
                tableLayout="fixed"
                scroll={{ x: 750 }}
              />
            ) : (
              <Empty description="Нет данных по расходу" />
            )}
          </Card>
        </Space>
      ) : null}
    </div>
  );
}