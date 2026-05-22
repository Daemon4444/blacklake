import { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Space, Row, Col, Form, Input, Select, message, Statistic, Progress } from "antd";
import { MobileOutlined, ScanOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useAppStore } from "../../stores/useAppStore";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";
import EmptyState from "../../components/EmptyState";

export default function Production() {
  const { snapshot, fetchSnapshot } = useAppStore();
  const [filters, setFilters] = useState<{ keyword?: string; type?: string; status?: string }>({});
  const [form] = Form.useForm();

  useEffect(() => { fetchSnapshot(); }, []);
  if (!snapshot) return null;

  const completeMobile = async (id: string) => { await api.post(`/mobile/${id}/complete`); message.success("任务已完成"); fetchSnapshot(); };

  const filtered = (snapshot.mobileTasks || []).filter((t) => {
    if (filters.keyword && !`${t.id}${t.title}${t.target}`.includes(filters.keyword)) return false;
    if (filters.type && t.type !== filters.type) return false;
    if (filters.status && t.status !== filters.status) return false;
    return true;
  });

  const total = snapshot.mobileTasks?.length || 0;
  const done = snapshot.mobileTasks?.filter((t) => t.status === "已完成").length || 0;
  const pending = total - done;

  return (
    <>
      <PageHeader
        title="生产执行"
        subtitle="移动现场任务 · 报工 · 发料 · 质检"
        extra={<Button icon={<ReloadOutlined />} onClick={() => fetchSnapshot(true)}>刷新</Button>}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="任务总数" value={total} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="待完成" value={pending} valueStyle={{ color: pending > 0 ? "#fa8c16" : "#02b980" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="已完成" value={done} valueStyle={{ color: "#02b980" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="完成率" value={total ? Math.round((done / total) * 100) : 0} suffix="%" /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={<><MobileOutlined /> 移动现场任务</>} extra={<Tag color="green">扫码操作</Tag>}>
            <Form form={form} layout="inline" style={{ marginBottom: 12 }} onFinish={() => setFilters(form.getFieldsValue())}>
              <Form.Item name="keyword">
                <Input prefix={<SearchOutlined />} placeholder="任务/目标" allowClear style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="type">
                <Select placeholder="类型" allowClear style={{ width: 110 }}
                  options={["报工","发料","质检"].map((s) => ({ value: s, label: s }))} />
              </Form.Item>
              <Form.Item name="status">
                <Select placeholder="状态" allowClear style={{ width: 110 }}
                  options={["待执行","进行中","已完成"].map((s) => ({ value: s, label: s }))} />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">搜索</Button>
                  <Button onClick={() => { form.resetFields(); setFilters({}); }}>重置</Button>
                </Space>
              </Form.Item>
            </Form>
            <Table dataSource={filtered} rowKey="id" size="small"
              locale={{ emptyText: <EmptyState description="暂无现场任务" /> }}
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
              columns={[
                { title: "类型", dataIndex: "type", width: 70, render: (t: string) => <Tag color={t === "报工" ? "green" : t === "发料" ? "blue" : "orange"}>{t}</Tag> },
                { title: "任务", dataIndex: "title" },
                { title: "目标", dataIndex: "target", width: 110 },
                { title: "扫码", dataIndex: "scanCode", width: 130, render: (c: string) => <Tag icon={<ScanOutlined />}>{c}</Tag> },
                { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <StatusTag status={s} /> },
                { title: "操作", width: 90, render: (_: any, r: any) => r.status !== "已完成" && <Button size="small" type="primary" onClick={() => completeMobile(r.id)}>完成</Button> },
              ]} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="产线实时状态" size="small">
            <Table dataSource={snapshot.lines} rowKey="id" size="small" pagination={false} columns={[
              { title: "产线", dataIndex: "name" },
              { title: "状态", dataIndex: "status", width: 80, render: (s: string) => <StatusTag status={s} /> },
              { title: "OEE", dataIndex: "oee", width: 110, render: (v: number) => <Progress percent={v} size="small" strokeColor={v >= 80 ? "#02b980" : "#fa8c16"} /> },
            ]} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
