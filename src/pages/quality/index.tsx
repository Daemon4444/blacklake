import { useEffect, useState, useCallback } from "react";
import { Card, Table, Tag, Button, Form, Input, Select, Modal, message, Popconfirm, Space, Row, Col, Statistic } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ExportOutlined } from "@ant-design/icons";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusTag from "../../components/StatusTag";
import { useAppStore } from "../../stores/useAppStore";
import type { QualityIssue } from "../../types";

interface PaginatedResp { data: QualityIssue[]; total: number; page: number; pageSize: number; }

const sevColor: Record<string, string> = { "高": "red", "中": "orange", "低": "blue" };

export default function Quality() {
  const { fetchSnapshot } = useAppStore();
  const [list, setList] = useState<QualityIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QualityIssue | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, ratio: 0 });

  const fetchStats = async () => {
    const { data } = await api.get<PaginatedResp>("/quality", { params: { page: 1, pageSize: 999 } });
    const all = data.data || [];
    const open = all.filter((q) => q.status !== "已关闭").length;
    setStats({
      total: all.length, open, closed: all.length - open,
      ratio: all.length ? Math.round(((all.length - open) / all.length) * 100) : 0,
    });
  };

  const fetchList = useCallback(async (overrideF?: any, overrideP?: number, overridePS?: number) => {
    setLoading(true);
    try {
      const f = overrideF ?? filters;
      const p = overrideP ?? page;
      const ps = overridePS ?? pageSize;
      const params: any = { page: p, pageSize: ps };
      if (f.keyword) params.keyword = f.keyword;
      if (f.severity) params.severity = f.severity;
      if (f.status) params.status = f.status;
      const { data } = await api.get<PaginatedResp>("/quality", { params });
      setList(data.data || []);
      setTotal(data.total || 0);
    } catch {
      message.error("获取质量数据失败");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSearch = () => {
    const v = searchForm.getFieldsValue();
    setFilters(v); setPage(1);
    fetchList(v, 1);
  };
  const handleReset = () => { searchForm.resetFields(); setFilters({}); setPage(1); fetchList({}, 1); };

  const openCreate = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ severity: "中", status: "待处理" }); setModalOpen(true); };
  const openEdit = (r: QualityIssue) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const submit = async () => {
    try {
      const v = await form.validateFields();
      if (editing) {
        await api.put(`/quality/${editing.id}`, v);
        message.success("已更新");
      } else {
        await api.post("/quality", v);
        message.success("已创建");
      }
      setModalOpen(false);
      fetchList(); fetchStats(); fetchSnapshot();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("操作失败");
    }
  };

  const closeIssue = async (id: string) => {
    await api.post(`/quality/${id}/close`);
    message.success("已关闭");
    fetchList(); fetchStats(); fetchSnapshot();
  };

  const remove = async (id: string) => {
    await api.delete(`/quality/${id}`);
    message.success("已删除");
    fetchList(); fetchStats();
  };

  const transitStatus = async (r: QualityIssue, status: string) => {
    await api.put(`/quality/${r.id}`, { status });
    message.success("状态已更新");
    fetchList(); fetchStats();
  };

  const exportCsv = () => {
    const header = ["编号", "批次", "严重度", "来源", "责任人", "状态", "根因"];
    const rows = list.map((r) => [r.id, r.batch, r.severity, r.source, r.owner, r.status, r.rootCause]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? "")}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `quality_${Date.now()}.csv`; a.click();
  };

  return (
    <>
      <PageHeader
        title="质量管理"
        subtitle="质量偏差登记 · 处理流转 · 关闭归档"
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => { fetchList(); fetchStats(); }}>刷新</Button>
            <Button icon={<ExportOutlined />} onClick={exportCsv}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建偏差</Button>
          </>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="总偏差" value={stats.total} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="待处理/处理中" value={stats.open} valueStyle={{ color: stats.open > 0 ? "#cf1322" : "#02b980" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="已关闭" value={stats.closed} valueStyle={{ color: "#02b980" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="关闭率" value={stats.ratio} suffix="%" /></Card></Col>
      </Row>

      <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 0 } }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="编号 / 批次 / 来源" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="severity">
            <Select placeholder="严重度" allowClear style={{ width: 110 }}
              options={["高","中","低"].map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 130 }}
              options={["待处理","处理中","已关闭"].map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table<QualityIssue>
          dataSource={list}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: <EmptyState description="暂无质量偏差" action={<Button type="primary" onClick={openCreate}>登记第一个偏差</Button>} /> }}
          pagination={{
            current: page, pageSize, total,
            showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); fetchList(undefined, p, ps); },
          }}
          columns={[
            { title: "编号", dataIndex: "id", width: 110 },
            { title: "批次", dataIndex: "batch", width: 140 },
            { title: "严重度", dataIndex: "severity", width: 90, render: (s: string) => <Tag color={sevColor[s]}>{s}</Tag> },
            { title: "来源", dataIndex: "source" },
            { title: "责任人", dataIndex: "owner", width: 90 },
            { title: "根因", dataIndex: "rootCause", ellipsis: true },
            { title: "状态", dataIndex: "status", width: 100, render: (s: string) => <StatusTag status={s} /> },
            { title: "操作", width: 240, render: (_: any, r: QualityIssue) => (
              <Space size={4}>
                {r.status === "待处理" && <Button size="small" type="link" onClick={() => transitStatus(r, "处理中")}>开始处理</Button>}
                {r.status !== "已关闭" && <Button size="small" type="link" onClick={() => closeIssue(r.id)}>关闭</Button>}
                <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
                <Popconfirm title="确认删除该偏差？" onConfirm={() => remove(r.id)}>
                  <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ) },
          ]}
        />
      </Card>

      <Modal
        title={editing ? `编辑偏差 ${editing.id}` : "登记质量偏差"}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
        okText="保存" cancelText="取消"
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="batch" label="批次号" rules={[{ required: true, message: "请输入批次号" }]}><Input placeholder="如：B-2026-0512" /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="severity" label="严重度" rules={[{ required: true }]}>
              <Select options={["高","中","低"].map((s) => ({ value: s, label: s }))} />
            </Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select options={["待处理","处理中","已关闭"].map((s) => ({ value: s, label: s }))} />
            </Form.Item></Col>
          </Row>
          <Form.Item name="source" label="来源/产线" rules={[{ required: true }]}><Input placeholder="如：L2 - 涂布" /></Form.Item>
          <Form.Item name="owner" label="责任人"><Input /></Form.Item>
          <Form.Item name="rootCause" label="根因分析"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
