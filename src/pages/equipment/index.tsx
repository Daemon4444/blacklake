import { useEffect, useState, useCallback } from "react";
import { Card, Table, Tag, Button, Progress, Form, Input, Select, Modal, message, Popconfirm, Space, Row, Col, Statistic, InputNumber, Drawer, Descriptions, Timeline } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ExportOutlined, EyeOutlined, ToolOutlined } from "@ant-design/icons";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusTag from "../../components/StatusTag";
import { useAppStore } from "../../stores/useAppStore";
import type { EquipmentAsset } from "../../types";

interface PaginatedResp { data: EquipmentAsset[]; total: number; page: number; pageSize: number; }

export default function Equipment() {
  const { fetchSnapshot } = useAppStore();
  const [list, setList] = useState<EquipmentAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentAsset | null>(null);
  const [form] = Form.useForm();
  const [detail, setDetail] = useState<EquipmentAsset | null>(null);
  const [stats, setStats] = useState({ total: 0, avgHealth: 0, alarming: 0, avgOee: 0 });

  const fetchStats = async () => {
    const { data } = await api.get<PaginatedResp>("/equipment", { params: { page: 1, pageSize: 999 } });
    const all = data.data || [];
    setStats({
      total: all.length,
      avgHealth: all.length ? Math.round(all.reduce((s, e) => s + e.health, 0) / all.length) : 0,
      alarming: all.filter((e) => e.status === "告警").length,
      avgOee: all.length ? Math.round(all.reduce((s, e) => s + e.oee, 0) / all.length) : 0,
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
      if (f.status) params.status = f.status;
      if (f.line) params.line = f.line;
      const { data } = await api.get<PaginatedResp>("/equipment", { params });
      setList(data.data || []);
      setTotal(data.total || 0);
    } catch {
      message.error("获取设备数据失败");
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

  const openCreate = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ status: "运行", health: 95, oee: 80, temperature: 35, vibration: 1.0 }); setModalOpen(true); };
  const openEdit = (r: EquipmentAsset) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const submit = async () => {
    try {
      const v = await form.validateFields();
      if (editing) {
        await api.put(`/equipment/${editing.id}`, v);
        message.success("已更新");
      } else {
        await api.post("/equipment", v);
        message.success("已创建");
      }
      setModalOpen(false);
      fetchList(); fetchStats(); fetchSnapshot();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("操作失败");
    }
  };

  const checkEquip = async (id: string) => {
    await api.post(`/equipment/${id}/check`);
    message.success("已点检");
    fetchList(); fetchStats(); fetchSnapshot();
  };

  const remove = async (id: string) => {
    await api.delete(`/equipment/${id}`);
    message.success("已删除");
    fetchList(); fetchStats();
  };

  const exportCsv = () => {
    const header = ["设备号", "名称", "产线", "工厂", "状态", "健康", "OEE"];
    const rows = list.map((r) => [r.id, r.name, r.line, r.plant, r.status, r.health, r.oee]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? "")}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `equipment_${Date.now()}.csv`; a.click();
  };

  return (
    <>
      <PageHeader
        title="设备管理"
        subtitle="设备健康度 · OEE · 保养记录全景"
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => { fetchList(); fetchStats(); }}>刷新</Button>
            <Button icon={<ExportOutlined />} onClick={exportCsv}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建设备</Button>
          </>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="设备总数" value={stats.total} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="平均健康度" value={stats.avgHealth} suffix="%" valueStyle={{ color: stats.avgHealth >= 80 ? "#02b980" : "#cf1322" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="告警设备" value={stats.alarming} valueStyle={{ color: stats.alarming > 0 ? "#fa8c16" : "#02b980" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="平均 OEE" value={stats.avgOee} suffix="%" /></Card></Col>
      </Row>

      <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 0 } }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="设备号 / 名称 / 工厂" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 120 }}
              options={["运行","告警","保养中","停机"].map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="line">
            <Select placeholder="产线" allowClear style={{ width: 120 }}
              options={["L1","L2","L3","L4"].map((s) => ({ value: s, label: s }))} />
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
        <Table<EquipmentAsset>
          dataSource={list}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: <EmptyState description="暂无设备" action={<Button type="primary" onClick={openCreate}>登记第一台设备</Button>} /> }}
          pagination={{
            current: page, pageSize, total,
            showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); fetchList(undefined, p, ps); },
          }}
          scroll={{ x: 1100 }}
          columns={[
            { title: "设备号", dataIndex: "id", width: 90 },
            { title: "名称", dataIndex: "name" },
            { title: "产线", dataIndex: "line", width: 70 },
            { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <StatusTag status={s} /> },
            { title: "健康度", dataIndex: "health", width: 140, sorter: (a, b) => a.health - b.health,
              render: (v: number) => <Progress percent={v} size="small" strokeColor={v >= 80 ? "#02b980" : v >= 60 ? "#fa8c16" : "#cf1322"} /> },
            { title: "OEE", dataIndex: "oee", width: 90, sorter: (a, b) => a.oee - b.oee, render: (v: number) => `${v}%` },
            { title: "温度", dataIndex: "temperature", width: 80, render: (v: number) => <span style={{ color: v > 45 ? "#cf1322" : undefined }}>{v}°C</span> },
            { title: "振动", dataIndex: "vibration", width: 90, render: (v: number) => <span style={{ color: v > 3 ? "#cf1322" : undefined }}>{v}mm/s</span> },
            { title: "下次保养", dataIndex: "nextMaintenance", width: 100 },
            { title: "操作", width: 240, fixed: "right", render: (_: any, r: EquipmentAsset) => (
              <Space size={4}>
                <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => setDetail(r)}>详情</Button>
                <Button size="small" type="link" icon={<ToolOutlined />} onClick={() => checkEquip(r.id)}>点检</Button>
                <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
                <Popconfirm title="确认删除该设备？" onConfirm={() => remove(r.id)}>
                  <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ) },
          ]}
        />
      </Card>

      <Modal
        title={editing ? `编辑设备 ${editing.id}` : "新建设备"}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden width={640}
        okText="保存" cancelText="取消"
      >
        <Form form={form} layout="vertical" preserve={false}>
          {!editing && <Form.Item name="id" label="设备号" extra="留空自动生成"><Input /></Form.Item>}
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="line" label="产线" rules={[{ required: true }]}><Input placeholder="如：L1" /></Form.Item></Col>
            <Col span={12}><Form.Item name="plant" label="工厂"><Input placeholder="如：上海一厂" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select options={["运行","告警","保养中","停机"].map((s) => ({ value: s, label: s }))} />
            </Form.Item></Col>
            <Col span={12}><Form.Item name="owner" label="责任人"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="health" label="健康度"><InputNumber min={0} max={100} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="oee" label="OEE"><InputNumber min={0} max={100} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="temperature" label="温度"><InputNumber style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="vibration" label="振动"><InputNumber step={0.1} style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Form.Item name="nextMaintenance" label="下次保养"><Input placeholder="如：7 天后" /></Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={detail ? `设备详情 · ${detail.id}` : ""}
        open={!!detail}
        onClose={() => setDetail(null)}
        width={520}
      >
        {detail && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="名称">{detail.name}</Descriptions.Item>
              <Descriptions.Item label="所属产线">{detail.line}</Descriptions.Item>
              <Descriptions.Item label="工厂">{detail.plant}</Descriptions.Item>
              <Descriptions.Item label="状态"><StatusTag status={detail.status} /></Descriptions.Item>
              <Descriptions.Item label="健康度"><Progress percent={detail.health} size="small" /></Descriptions.Item>
              <Descriptions.Item label="OEE">{detail.oee}%</Descriptions.Item>
              <Descriptions.Item label="温度 / 振动">{detail.temperature}°C / {detail.vibration}mm/s</Descriptions.Item>
              <Descriptions.Item label="责任人">{detail.owner || "—"}</Descriptions.Item>
              <Descriptions.Item label="下次保养">{detail.nextMaintenance || "—"}</Descriptions.Item>
              <Descriptions.Item label="传感器">{(detail.sensors || []).map((s) => <Tag key={s}>{s}</Tag>)}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ marginTop: 16 }}>保养与故障历史（演示）</h4>
            <Timeline items={[
              { color: "green", children: <>最近一次点检完成 · 健康度 {detail.health}%<div style={{ fontSize: 12, color: "#999" }}>{detail.nextMaintenance || "—"}</div></> },
              { color: detail.status === "告警" ? "red" : "blue", children: <>当前状态：{detail.status}<div style={{ fontSize: 12, color: "#999" }}>温度 {detail.temperature}°C · 振动 {detail.vibration}mm/s</div></> },
              { children: <>设备投产投用<div style={{ fontSize: 12, color: "#999" }}>资产入账</div></> },
            ]} />
          </>
        )}
      </Drawer>
    </>
  );
}
