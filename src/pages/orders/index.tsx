import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Table, Tag, Progress, Button, Space, Form, Input, Select, message, Popconfirm, Dropdown } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined, ExportOutlined, MoreOutlined, EyeOutlined, EditOutlined, ThunderboltOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../services/api";
import { useAppStore } from "../../stores/useAppStore";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusTag from "../../components/StatusTag";
import OrderModal from "./CreateModal";
import type { WorkOrder } from "../../types";

const priorityColor: Record<string, string> = { P0: "red", P1: "orange", P2: "blue" };

interface PaginatedResp { data: WorkOrder[]; total: number; page: number; pageSize: number; }

export default function Orders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { snapshot, fetchSnapshot } = useAppStore();
  const [list, setList] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{ keyword?: string; status?: string; priority?: string; line?: string }>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkOrder | null>(null);
  const [form] = Form.useForm();

  const fetchList = useCallback(async (overrideFilters?: any, overridePage?: number, overridePageSize?: number) => {
    setLoading(true);
    try {
      const f = overrideFilters ?? filters;
      const p = overridePage ?? page;
      const ps = overridePageSize ?? pageSize;
      const params: any = { page: p, pageSize: ps };
      if (f.keyword) params.keyword = f.keyword;
      if (f.status) params.status = f.status;
      if (f.priority) params.priority = f.priority;
      if (f.line) params.line = f.line;
      const { data } = await api.get<PaginatedResp>("/orders", { params });
      setList(data.data || []);
      setTotal(data.total || 0);
    } catch {
      message.error("获取工单失败");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchSnapshot();
    // 支持来自全局搜索的关键词
    const kw = searchParams.get("keyword");
    if (kw) {
      form.setFieldValue("keyword", kw);
      setFilters((s) => ({ ...s, keyword: kw }));
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const f = {
      keyword: values.keyword?.trim(),
      status: values.status,
      priority: values.priority,
      line: values.line,
    };
    setFilters(f);
    setPage(1);
    fetchList(f, 1);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({});
    setPage(1);
    fetchList({}, 1);
  };

  const advance = async (id: string) => {
    await api.post(`/orders/${id}/advance`);
    message.success("已报工");
    fetchList();
  };

  const remove = async (id: string) => {
    await api.delete(`/orders/${id}`);
    message.success("已删除");
    fetchList();
  };

  const batchClose = async () => {
    if (selectedRowKeys.length === 0) return message.warning("请先选择工单");
    await Promise.all(selectedRowKeys.map((id) => api.put(`/orders/${id}`, { status: "完成", progress: 100 })));
    message.success(`已批量关闭 ${selectedRowKeys.length} 个工单`);
    setSelectedRowKeys([]);
    fetchList();
  };

  const exportCsv = () => {
    const header = ["工单号", "客户", "SKU", "产线", "优先级", "状态", "进度", "交期"];
    const rows = list.map((r) => [r.id, r.customer, r.sku, r.line, r.priority, r.status, `${r.progress}%`, r.due]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    message.success("已导出 CSV");
  };

  const lines = snapshot?.lines || [];

  return (
    <>
      <PageHeader
        title="订单履约"
        subtitle="覆盖工单创建、排程、报工、追溯的全生命周期管理"
        extra={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>刷新</Button>
            <Button icon={<ExportOutlined />} onClick={exportCsv}>导出</Button>
            <Dropdown
              menu={{
                items: [
                  { key: "close", label: `批量关闭（已选 ${selectedRowKeys.length}）`, onClick: batchClose },
                ],
              }}
              disabled={selectedRowKeys.length === 0}
            >
              <Button>批量操作</Button>
            </Dropdown>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setModalOpen(true); }}>新建工单</Button>
          </>
        }
      />

      <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 0 } }}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="工单号 / 客户 / SKU" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 120 }}
              options={["正常","风险","阻塞","完成"].map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="priority">
            <Select placeholder="优先级" allowClear style={{ width: 120 }}
              options={["P0","P1","P2"].map((p) => ({ value: p, label: p }))} />
          </Form.Item>
          <Form.Item name="line">
            <Select placeholder="产线" allowClear style={{ width: 130 }}
              options={lines.map((l) => ({ value: l.id, label: l.id }))} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table<WorkOrder>
          dataSource={list}
          rowKey="id"
          loading={loading}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          locale={{ emptyText: <EmptyState description="暂无工单" action={<Button type="primary" onClick={() => { setEditing(null); setModalOpen(true); }}>创建第一个工单</Button>} /> }}
          pagination={{
            current: page, pageSize, total,
            showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
            pageSizeOptions: [10, 20, 50],
            onChange: (p, ps) => { setPage(p); setPageSize(ps); fetchList(undefined, p, ps); },
          }}
          scroll={{ x: 1100 }}
          columns={[
            { title: "工单号", dataIndex: "id", width: 110, fixed: "left",
              render: (id: string) => <a onClick={() => navigate(`/app/orders/${id}`)}>{id}</a> },
            { title: "优先级", dataIndex: "priority", width: 80, render: (p: string) => <Tag color={priorityColor[p]}>{p}</Tag>, sorter: (a, b) => a.priority.localeCompare(b.priority) },
            { title: "客户", dataIndex: "customer", width: 130 },
            { title: "SKU", dataIndex: "sku", width: 200, ellipsis: true },
            { title: "产线", dataIndex: "line", width: 80 },
            { title: "进度", dataIndex: "progress", width: 140, sorter: (a, b) => a.progress - b.progress, render: (p: number) => <Progress percent={p} size="small" /> },
            { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <StatusTag status={s} /> },
            { title: "阻塞项", dataIndex: "blockers", width: 160, render: (b: string[]) => (b || []).length === 0 ? "—" : (b || []).map((x) => <Tag key={x} color="red">{x}</Tag>) },
            { title: "交期", dataIndex: "due", width: 110, sorter: (a, b) => (a.due || "").localeCompare(b.due || "") },
            { title: "操作", width: 200, fixed: "right", render: (_: any, r: any) => (
              <Space size={4}>
                <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => navigate(`/app/orders/${r.id}`)}>查看</Button>
                <Button size="small" type="link" icon={<EditOutlined />} onClick={() => { setEditing(r); setModalOpen(true); }}>编辑</Button>
                {r.status !== "完成" && <Button size="small" type="link" icon={<ThunderboltOutlined />} onClick={() => advance(r.id)}>报工</Button>}
                <Popconfirm title="确认删除该工单？" onConfirm={() => remove(r.id)}>
                  <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ) },
          ]}
        />
      </Card>

      <OrderModal
        open={modalOpen}
        record={editing}
        lines={lines}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { fetchList(); fetchSnapshot(); }}
      />
    </>
  );
}
