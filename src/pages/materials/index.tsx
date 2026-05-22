import { useEffect, useState, useCallback } from "react";
import { Card, Table, Tag, Button, Progress, Row, Col, Statistic, Alert, Form, Input, Select, Modal, InputNumber, message, Popconfirm, Space, Switch } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ImportOutlined, ExportOutlined, WarningOutlined } from "@ant-design/icons";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { useAppStore } from "../../stores/useAppStore";
import type { Material } from "../../types";

interface PaginatedResp { data: Material[]; total: number; page: number; pageSize: number; }

export default function Materials() {
  const { fetchSnapshot } = useAppStore();
  const [list, setList] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ keyword?: string; lowStockOnly?: boolean }>({});
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<Material | null>(null);
  const [form] = Form.useForm();
  const [moveForm] = Form.useForm();

  // 顶部统计需要全量数据，单独取一次
  const [allStats, setAllStats] = useState({ total: 0, low: 0, totalStock: 0, ratio: 100 });

  const fetchList = useCallback(async (overrideFilters?: any, overridePage?: number, overridePageSize?: number) => {
    setLoading(true);
    try {
      const f = overrideFilters ?? filters;
      const p = overridePage ?? page;
      const ps = overridePageSize ?? pageSize;
      const params: any = { page: p, pageSize: ps };
      if (f.keyword) params.keyword = f.keyword;
      if (f.lowStockOnly) params.lowStockOnly = "1";
      const { data } = await api.get<PaginatedResp>("/materials", { params });
      setList(data.data || []);
      setTotal(data.total || 0);
    } catch {
      message.error("获取物料失败");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  const fetchStats = async () => {
    const { data } = await api.get<PaginatedResp>("/materials", { params: { page: 1, pageSize: 999 } });
    const list = data.data || [];
    const low = list.filter((m) => m.stock < m.safeStock).length;
    setAllStats({
      total: list.length,
      low,
      totalStock: list.reduce((s, m) => s + m.stock, 0),
      ratio: list.length ? Math.round(((list.length - low) / list.length) * 100) : 100,
    });
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSearch = () => {
    const v = searchForm.getFieldsValue();
    const f = { keyword: v.keyword?.trim(), lowStockOnly: v.lowStockOnly };
    setFilters(f); setPage(1);
    fetchList(f, 1);
  };
  const handleReset = () => { searchForm.resetFields(); setFilters({}); setPage(1); fetchList({}, 1); };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ stock: 0, safeStock: 100 });
    setModalOpen(true);
  };
  const openEdit = (record: Material) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await api.put(`/materials/${editing.id}`, values);
        message.success("已更新");
      } else {
        await api.post("/materials", values);
        message.success("已创建");
      }
      setModalOpen(false);
      fetchList(); fetchStats(); fetchSnapshot();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.error || "操作失败");
    }
  };

  const replenish = async (id: string) => {
    await api.post(`/materials/${id}/replenish`);
    message.success("已补货");
    fetchList(); fetchStats(); fetchSnapshot();
  };

  const remove = async (id: string) => {
    await api.delete(`/materials/${id}`);
    message.success("已删除");
    fetchList(); fetchStats();
  };

  const openMove = (m: Material) => {
    setMoveTarget(m);
    moveForm.resetFields();
    moveForm.setFieldsValue({ direction: "in", qty: 100, reason: "" });
    setMoveOpen(true);
  };

  const submitMove = async () => {
    if (!moveTarget) return;
    try {
      const v = await moveForm.validateFields();
      const delta = v.direction === "in" ? Number(v.qty) : -Number(v.qty);
      await api.post(`/materials/${moveTarget.id}/move`, { delta, reason: v.reason });
      message.success(v.direction === "in" ? "已入库" : "已出库");
      setMoveOpen(false);
      fetchList(); fetchStats();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("操作失败");
    }
  };

  const exportCsv = () => {
    const header = ["物料号", "名称", "库存", "安全库存", "库位"];
    const rows = list.map((r) => [r.id, r.name, r.stock, r.safeStock, r.location]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? "")}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `materials_${Date.now()}.csv`; a.click();
  };

  return (
    <>
      <PageHeader
        title="物料仓储"
        subtitle="物料主数据 · 库存看板 · 出入库流转"
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => { fetchList(); fetchStats(); }}>刷新</Button>
            <Button icon={<ExportOutlined />} onClick={exportCsv}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建物料</Button>
          </>
        }
      />

      {allStats.low > 0 && <Alert type="warning" icon={<WarningOutlined />} message={`${allStats.low} 项物料低于安全库存，请及时补货`} showIcon style={{ marginBottom: 16 }} />}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="物料总数" value={allStats.total} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="缺料预警" value={allStats.low} valueStyle={{ color: allStats.low > 0 ? "#cf1322" : "#02b980" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="总库存" value={allStats.totalStock} suffix="件" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="齐套率" value={allStats.ratio} suffix="%" valueStyle={{ color: allStats.ratio >= 90 ? "#02b980" : "#fa8c16" }} /></Card></Col>
      </Row>

      <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 0 } }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="物料号 / 名称 / 库位" allowClear style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="lowStockOnly" valuePropName="checked" label="仅显示缺料">
            <Switch />
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
        <Table<Material>
          dataSource={list}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: <EmptyState description="暂无物料" action={<Button type="primary" onClick={openCreate}>创建第一个物料</Button>} /> }}
          pagination={{
            current: page, pageSize, total,
            showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); fetchList(undefined, p, ps); },
          }}
          columns={[
            { title: "物料号", dataIndex: "id", width: 100 },
            { title: "名称", dataIndex: "name" },
            { title: "库存", dataIndex: "stock", width: 90, sorter: (a, b) => a.stock - b.stock,
              render: (v: number, r: Material) => <span style={{ color: v < r.safeStock ? "#cf1322" : undefined, fontWeight: v < r.safeStock ? 700 : undefined }}>{v}</span> },
            { title: "安全库存", dataIndex: "safeStock", width: 90 },
            { title: "库存健康", width: 160, render: (_: any, r: Material) => {
              const pct = Math.min(Math.round((r.stock / Math.max(1, r.safeStock)) * 100), 100);
              return <Progress percent={pct} size="small" status={pct < 100 ? "exception" : "success"} strokeColor={pct < 100 ? undefined : "#02b980"} />;
            } },
            { title: "库位", dataIndex: "location", width: 100 },
            { title: "关联工单", dataIndex: "linkedOrders", render: (o: string[]) => (o || []).length === 0 ? "—" : (o || []).map((x) => <Tag key={x}>{x}</Tag>) },
            { title: "操作", width: 240, render: (_: any, r: Material) => (
              <Space size={4}>
                <Button size="small" type="link" icon={<ImportOutlined />} onClick={() => openMove(r)}>出入库</Button>
                {r.stock < r.safeStock && <Button size="small" type="link" onClick={() => replenish(r.id)}>一键补货</Button>}
                <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
                <Popconfirm title="确认删除该物料？" onConfirm={() => remove(r.id)}>
                  <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ) },
          ]}
        />
      </Card>

      <Modal
        title={editing ? `编辑物料 ${editing.id}` : "新建物料"}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
        okText="保存" cancelText="取消"
      >
        <Form form={form} layout="vertical" preserve={false}>
          {!editing && <Form.Item name="id" label="物料号" extra="留空则自动生成"><Input placeholder="如：M-901" /></Form.Item>}
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="stock" label="当前库存" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="safeStock" label="安全库存" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Form.Item name="location" label="库位"><Input placeholder="如：A1-03" /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`出入库 · ${moveTarget?.id || ""}`}
        open={moveOpen}
        onOk={submitMove}
        onCancel={() => setMoveOpen(false)}
        destroyOnHidden
        okText="确认" cancelText="取消"
      >
        <Form form={moveForm} layout="vertical" preserve={false}>
          <Form.Item name="direction" label="方向" rules={[{ required: true }]}>
            <Select options={[{ value: "in", label: "入库" }, { value: "out", label: "出库" }]} />
          </Form.Item>
          <Form.Item name="qty" label="数量" rules={[{ required: true, type: "number", min: 1 }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="reason" label="原因/单据"><Input placeholder="如：WO-61928 领料" /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
