import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Descriptions, Tag, Progress, Timeline, Space, Button, message, Skeleton, Row, Col, Typography, Table, Empty } from "antd";
import { ArrowLeftOutlined, EditOutlined, ThunderboltOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "../../services/api";
import StatusTag from "../../components/StatusTag";
import OrderModal from "./CreateModal";
import { useAppStore } from "../../stores/useAppStore";

const { Text } = Typography;

interface OrderDetail {
  id: string; customer: string; sku: string; line: string; due: string;
  priority: string; status: string; progress: number; blockers: string[];
  createdAt?: string; updatedAt?: string;
  auditLogs?: any[]; qualityIssues?: any[];
}

const priorityColor: Record<string, string> = { P0: "red", P1: "orange", P2: "blue" };

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { snapshot, fetchSnapshot } = useAppStore();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: detail } = await api.get<OrderDetail>(`/orders/${id}`);
      setData(detail);
    } catch {
      message.error("工单加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); fetchSnapshot(); }, [id]);

  const advance = async () => {
    if (!id) return;
    await api.post(`/orders/${id}/advance`);
    message.success("已报工");
    load();
  };

  const closeOrder = async () => {
    if (!id) return;
    await api.put(`/orders/${id}`, { status: "完成", progress: 100 });
    message.success("工单已关闭");
    load();
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }
  if (!data) {
    return <Empty description="工单不存在" />;
  }

  const lines = snapshot?.lines || [];
  const lineInfo = lines.find((l) => l.id === data.line);

  // Timeline 推断生命周期
  const tlItems = [
    { color: "blue", children: <><Text strong>创建</Text><div style={{ color: "#999", fontSize: 12 }}>{data.createdAt ? new Date(data.createdAt).toLocaleString("zh-CN") : "—"}</div></> },
    { color: data.progress > 0 ? "green" : "gray", children: <><Text strong>排程并启动生产</Text><div style={{ color: "#999", fontSize: 12 }}>{data.progress > 0 ? "已开始" : "等待排程"}</div></> },
    { color: data.progress >= 50 ? "green" : "gray", children: <><Text strong>过半进度</Text><div style={{ color: "#999", fontSize: 12 }}>{data.progress >= 50 ? `${data.progress}%` : "—"}</div></> },
    { color: data.status === "完成" ? "green" : "gray", children: <><Text strong>完工</Text><div style={{ color: "#999", fontSize: 12 }}>{data.status === "完成" ? "已交付" : "进行中"}</div></> },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/app/orders")}>返回列表</Button>
        <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>编辑</Button>
        {data.status !== "完成" && <Button type="primary" icon={<ThunderboltOutlined />} onClick={advance}>报工推进</Button>}
        {data.status !== "完成" && <Button icon={<CheckCircleOutlined />} onClick={closeOrder}>关闭工单</Button>}
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space size={12}>
              <Typography.Title level={4} style={{ margin: 0 }}>{data.id}</Typography.Title>
              <Tag color={priorityColor[data.priority]}>{data.priority}</Tag>
              <StatusTag status={data.status} />
            </Space>
            <div style={{ color: "#666", marginTop: 4 }}>{data.customer} · {data.sku}</div>
          </Col>
          <Col flex="280px">
            <Progress percent={data.progress} status={data.status === "阻塞" ? "exception" : data.status === "完成" ? "success" : "active"} />
          </Col>
        </Row>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="客户">{data.customer}</Descriptions.Item>
          <Descriptions.Item label="SKU">{data.sku}</Descriptions.Item>
          <Descriptions.Item label="产线">{data.line}{lineInfo && ` · ${lineInfo.name}`}</Descriptions.Item>
          <Descriptions.Item label="优先级"><Tag color={priorityColor[data.priority]}>{data.priority}</Tag></Descriptions.Item>
          <Descriptions.Item label="状态"><StatusTag status={data.status} /></Descriptions.Item>
          <Descriptions.Item label="进度">{data.progress}%</Descriptions.Item>
          <Descriptions.Item label="计划交付">{data.due || "—"}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{data.createdAt ? new Date(data.createdAt).toLocaleString("zh-CN") : "—"}</Descriptions.Item>
          <Descriptions.Item label="阻塞项">
            {(data.blockers || []).length === 0 ? "—" : (data.blockers || []).map((b) => <Tag key={b} color="red">{b}</Tag>)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={10}>
          <Card title="生命周期" style={{ marginBottom: 16 }}>
            <Timeline items={tlItems} />
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card title="关联质量问题" style={{ marginBottom: 16 }}>
            {(data.qualityIssues || []).length === 0 ? (
              <Empty description="暂无相关质量记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table size="small" rowKey="id" pagination={false} dataSource={data.qualityIssues || []} columns={[
                { title: "编号", dataIndex: "id", width: 100 },
                { title: "批次", dataIndex: "batch" },
                { title: "严重度", dataIndex: "severity", width: 80, render: (s: string) => <Tag color={s === "高" ? "red" : "orange"}>{s}</Tag> },
                { title: "状态", dataIndex: "status", width: 80, render: (s: string) => <StatusTag status={s} /> },
              ]} />
            )}
          </Card>
          <Card title="操作日志">
            {(data.auditLogs || []).length === 0 ? (
              <Empty description="暂无操作记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table size="small" rowKey="id" pagination={{ pageSize: 5 }} dataSource={data.auditLogs || []} columns={[
                { title: "时间", dataIndex: "createdAt", width: 160, render: (t: string) => new Date(t).toLocaleString("zh-CN") },
                { title: "操作人", dataIndex: "actor", width: 80 },
                { title: "动作", dataIndex: "action", render: (a: string) => <Tag>{a}</Tag> },
              ]} />
            )}
          </Card>
        </Col>
      </Row>

      <OrderModal
        open={editOpen}
        record={data as any}
        lines={lines}
        onClose={() => setEditOpen(false)}
        onSuccess={() => load()}
      />
    </>
  );
}
