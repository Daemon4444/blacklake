import { useEffect, useState, useCallback } from "react";
import { Card, Table, Tag, Tabs, Space, Avatar, Button, Popconfirm, message, Form, Input, Select, Modal, Row, Col, DatePicker, Statistic, Descriptions } from "antd";
import { TeamOutlined, ReloadOutlined, PlusOutlined, EditOutlined, UserSwitchOutlined, SearchOutlined, ExportOutlined, AuditOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";
import { useAppStore } from "../../stores/useAppStore";
import { useAuthStore } from "../../stores/useAuthStore";
import type { User, AuditLog } from "../../types";

const ROLE_OPTIONS = [
  { value: "COO", label: "COO 总裁" },
  { value: "计划员", label: "计划员" },
  { value: "生产主管", label: "生产主管" },
  { value: "质量经理", label: "质量经理" },
  { value: "仓储主管", label: "仓储主管" },
  { value: "IT 顾问", label: "IT 顾问" },
];
const ROLE_KEY_OPTIONS = ["coo","planner","production","quality","warehouse","it"].map((v) => ({ value: v, label: v }));

export default function Admin() {
  const { snapshot, fetchSnapshot } = useAppStore();
  const { login } = useAuthStore();
  const [tab, setTab] = useState("users");

  // 用户管理
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userForm] = Form.useForm();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFilter] = Form.useForm();

  // 审计日志
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(20);
  const [logLoading, setLogLoading] = useState(false);
  const [logFilter] = Form.useForm();
  const [logFilters, setLogFilters] = useState<any>({});

  const fetchUsers = useCallback(async (params: any = {}) => {
    setUserLoading(true);
    try {
      const { data } = await api.get<User[]>("/users", { params });
      setUsers(data);
    } finally {
      setUserLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (overrideF?: any, overrideP?: number, overridePS?: number) => {
    setLogLoading(true);
    try {
      const f = overrideF ?? logFilters;
      const p = overrideP ?? logPage;
      const ps = overridePS ?? logPageSize;
      const params: any = { page: p, pageSize: ps };
      if (f.keyword) params.keyword = f.keyword;
      if (f.action) params.action = f.action;
      if (f.actor) params.actor = f.actor;
      if (f.range && f.range[0]) params.from = (f.range[0] as Dayjs).startOf("day").toISOString();
      if (f.range && f.range[1]) params.to = (f.range[1] as Dayjs).endOf("day").toISOString();
      const { data } = await api.get<{ data: AuditLog[]; total: number }>("/audit", { params });
      setLogs(data.data || []);
      setLogTotal(data.total || 0);
    } finally {
      setLogLoading(false);
    }
  }, [logFilters, logPage, logPageSize]);

  useEffect(() => { fetchUsers(); fetchSnapshot(); }, []);
  useEffect(() => { if (tab === "audit") fetchLogs(); }, [tab, fetchLogs]);

  const userSearch = () => {
    const v = userFilter.getFieldsValue();
    fetchUsers({ keyword: v.keyword, role: v.role, status: v.status });
  };
  const userReset = () => { userFilter.resetFields(); fetchUsers(); };

  const switchToUser = async (userId: string) => {
    const ok = await login(userId, "demo123");
    if (ok) { message.success("已切换角色"); fetchSnapshot(); }
    else message.error("切换失败");
  };

  const openCreateUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    userForm.setFieldsValue({ roleKey: "planner", status: "离线", permissions: [] });
    setUserModalOpen(true);
  };
  const openEditUser = (u: User) => {
    setEditingUser(u);
    userForm.setFieldsValue(u);
    setUserModalOpen(true);
  };

  const submitUser = async () => {
    try {
      const v = await userForm.validateFields();
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, v);
        message.success("已更新");
      } else {
        await api.post("/users", v);
        message.success("已创建");
      }
      setUserModalOpen(false);
      fetchUsers();
      fetchSnapshot();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("操作失败");
    }
  };

  const disableUser = async (id: string) => {
    await api.delete(`/users/${id}`);
    message.success("已停用");
    fetchUsers();
    fetchSnapshot();
  };

  const resetDemo = async () => {
    await api.post("/admin/reset");
    message.success("演示环境已重置");
    fetchSnapshot();
    if (tab === "audit") fetchLogs();
  };

  const exportLogs = () => {
    const header = ["时间", "操作人", "动作", "对象"];
    const rows = logs.map((l) => [new Date(l.createdAt).toLocaleString("zh-CN"), l.actor, l.action, l.entity]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? "")}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `audit_${Date.now()}.csv`; a.click();
  };

  const onlineCount = users.filter((u) => u.status === "在线").length;

  return (
    <>
      <PageHeader title="系统管理" subtitle="用户权限 · 审计追踪 · 运维操作" />

      <Tabs activeKey={tab} onChange={setTab} items={[
        {
          key: "users",
          label: <span><TeamOutlined /> 用户权限</span>,
          children: (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={6}><Card><Statistic title="员工总数" value={users.length} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="在线人数" value={onlineCount} valueStyle={{ color: "#02b980" }} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="角色数量" value={new Set(users.map((u) => u.role)).size} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="工厂数量" value={new Set(users.map((u) => u.plant).filter(Boolean)).size} /></Card></Col>
              </Row>

              <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 0 } }}>
                <Form form={userFilter} layout="inline" onFinish={userSearch}>
                  <Form.Item name="keyword">
                    <Input prefix={<SearchOutlined />} placeholder="姓名 / ID / 邮箱" allowClear style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="role">
                    <Select placeholder="角色" allowClear style={{ width: 140 }} options={ROLE_OPTIONS} />
                  </Form.Item>
                  <Form.Item name="status">
                    <Select placeholder="状态" allowClear style={{ width: 120 }}
                      options={["在线","离线","已停用"].map((s) => ({ value: s, label: s }))} />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit">搜索</Button>
                      <Button onClick={userReset}>重置</Button>
                      <Button icon={<PlusOutlined />} onClick={openCreateUser}>新建用户</Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>

              <Card>
                <Table<User>
                  dataSource={users}
                  rowKey="id"
                  loading={userLoading}
                  pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 人` }}
                  columns={[
                    { title: "员工", width: 160, render: (_: any, u: User) => <Space><Avatar size="small" style={{ background: "#02b980" }}>{u.name[0]}</Avatar>{u.name}<span style={{ color: "#999", fontSize: 12 }}>{u.id}</span></Space> },
                    { title: "角色", dataIndex: "role", width: 110 },
                    { title: "部门", dataIndex: "department" },
                    { title: "工厂", dataIndex: "plant", width: 110 },
                    { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <StatusTag status={s} /> },
                    { title: "权限", dataIndex: "permissions", render: (p: string[]) => <Space wrap>{(p || []).slice(0, 3).map((x) => <Tag key={x} style={{ fontSize: 11 }}>{x}</Tag>)}{(p || []).length > 3 && <Tag>+{(p || []).length - 3}</Tag>}</Space> },
                    { title: "操作", width: 220, render: (_: any, u: User) => (
                      <Space size={4}>
                        <Button size="small" type="link" icon={<UserSwitchOutlined />} onClick={() => switchToUser(u.id)}>切换</Button>
                        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEditUser(u)}>编辑</Button>
                        <Popconfirm title="确认停用该用户？" onConfirm={() => disableUser(u.id)}>
                          <Button size="small" type="link" danger>停用</Button>
                        </Popconfirm>
                      </Space>
                    ) },
                  ]}
                />
              </Card>
            </>
          ),
        },
        {
          key: "audit",
          label: <span><AuditOutlined /> 审计日志</span>,
          children: (
            <>
              <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 0 } }}>
                <Form form={logFilter} layout="inline" onFinish={() => {
                  const v = logFilter.getFieldsValue();
                  setLogFilters(v); setLogPage(1);
                  fetchLogs(v, 1);
                }}>
                  <Form.Item name="keyword">
                    <Input prefix={<SearchOutlined />} placeholder="对象 / 操作人" allowClear style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="action">
                    <Select placeholder="动作" allowClear style={{ width: 180 }}
                      options={["login","create_order","update_order","advance_order","delete_order","close_quality_issue","replenish_material","equipment_check","execute_recommendation"].map((a) => ({ value: a, label: a }))} />
                  </Form.Item>
                  <Form.Item name="range">
                    <DatePicker.RangePicker style={{ width: 280 }} />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit">搜索</Button>
                      <Button onClick={() => { logFilter.resetFields(); setLogFilters({}); setLogPage(1); fetchLogs({}, 1); }}>重置</Button>
                      <Button icon={<ReloadOutlined />} onClick={() => fetchLogs()}>刷新</Button>
                      <Button icon={<ExportOutlined />} onClick={exportLogs}>导出</Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>

              <Card>
                <Table<AuditLog>
                  dataSource={logs}
                  rowKey="id"
                  loading={logLoading}
                  pagination={{
                    current: logPage, pageSize: logPageSize, total: logTotal,
                    showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
                    onChange: (p, ps) => { setLogPage(p); setLogPageSize(ps); fetchLogs(undefined, p, ps); },
                  }}
                  columns={[
                    { title: "时间", dataIndex: "createdAt", width: 180, render: (t: string) => dayjs(t).format("YYYY-MM-DD HH:mm:ss") },
                    { title: "操作人", dataIndex: "actor", width: 100 },
                    { title: "动作", dataIndex: "action", width: 200, render: (a: string) => <Tag>{a}</Tag> },
                    { title: "对象", dataIndex: "entity" },
                  ]}
                  expandable={{
                    expandedRowRender: (r: any) => (
                      <Descriptions size="small" column={2} bordered>
                        <Descriptions.Item label="变更前" span={2}>
                          <pre style={{ margin: 0, maxHeight: 200, overflow: "auto", fontSize: 11 }}>{r.beforeJson ? JSON.stringify(r.beforeJson, null, 2) : "—"}</pre>
                        </Descriptions.Item>
                        <Descriptions.Item label="变更后" span={2}>
                          <pre style={{ margin: 0, maxHeight: 200, overflow: "auto", fontSize: 11 }}>{r.afterJson ? JSON.stringify(r.afterJson, null, 2) : "—"}</pre>
                        </Descriptions.Item>
                      </Descriptions>
                    ),
                  }}
                />
              </Card>
            </>
          ),
        },
        {
          key: "system",
          label: "系统运维",
          children: (
            <Card>
              <Descriptions bordered column={1} size="small" title="环境信息">
                <Descriptions.Item label="数据库引擎">PostgreSQL 13</Descriptions.Item>
                <Descriptions.Item label="数据库名">blacklake_db</Descriptions.Item>
                <Descriptions.Item label="租户">{snapshot?.tenant?.name || "—"}</Descriptions.Item>
                <Descriptions.Item label="套餐">{snapshot?.tenant?.plan || "—"}</Descriptions.Item>
                <Descriptions.Item label="模块数">9 个</Descriptions.Item>
                <Descriptions.Item label="工厂 / 产线">{snapshot?.tenant?.plants || 0} / {snapshot?.tenant?.lines || 0}</Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 16 }}>
                <Popconfirm title="确定重置演示环境？这将清空事件、审计日志和 AI 建议" onConfirm={resetDemo}>
                  <Button danger icon={<ReloadOutlined />}>重置演示数据</Button>
                </Popconfirm>
              </div>
            </Card>
          ),
        },
      ]} />

      <Modal
        title={editingUser ? `编辑用户 ${editingUser.id}` : "新建用户"}
        open={userModalOpen}
        onOk={submitUser}
        onCancel={() => setUserModalOpen(false)}
        destroyOnHidden width={640}
        okText="保存" cancelText="取消"
      >
        <Form form={userForm} layout="vertical" preserve={false}>
          {!editingUser && <Form.Item name="id" label="员工号" extra="留空自动生成"><Input /></Form.Item>}
          <Row gutter={12}>
            <Col span={12}><Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="邮箱"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="role" label="角色" rules={[{ required: true }]}>
              <Select options={ROLE_OPTIONS} />
            </Form.Item></Col>
            <Col span={12}><Form.Item name="roleKey" label="角色编码" rules={[{ required: true }]}>
              <Select options={ROLE_KEY_OPTIONS} />
            </Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="department" label="部门"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="title" label="职位"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="plant" label="工厂"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态"><Select options={["在线","离线","已停用"].map((s) => ({ value: s, label: s }))} /></Form.Item></Col>
          </Row>
          <Form.Item name="permissions" label="权限">
            <Select mode="tags" placeholder="输入权限标识，回车添加" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
