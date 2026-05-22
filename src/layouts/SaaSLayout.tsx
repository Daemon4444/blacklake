import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space, Typography, Breadcrumb, Input, Tag, Empty, AutoComplete } from "antd";
import {
  DashboardOutlined, OrderedListOutlined, ToolOutlined, DatabaseOutlined,
  SettingOutlined, ShopOutlined, RocketOutlined, BulbOutlined, ApiOutlined,
  MobileOutlined, FundProjectionScreenOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, BellOutlined, LogoutOutlined, UserOutlined,
  SafetyCertificateOutlined, PartitionOutlined, HomeOutlined, SearchOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores/useAuthStore";
import { useAppStore } from "../stores/useAppStore";
import { useSSE } from "../hooks/useSSE";
import api from "../services/api";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const SIDER_BG = "#00140e";
const PRIMARY = "#02b980";

const menuItems = [
  { key: "/app", icon: <DashboardOutlined />, label: "经营总览" },
  { key: "/app/orders", icon: <OrderedListOutlined />, label: "订单履约" },
  { key: "/app/production", icon: <MobileOutlined />, label: "生产执行" },
  { key: "/app/quality", icon: <SafetyCertificateOutlined />, label: "质量管理" },
  { key: "/app/materials", icon: <DatabaseOutlined />, label: "物料仓储" },
  { key: "/app/equipment", icon: <ToolOutlined />, label: "设备管理" },
  { key: "/app/process", icon: <PartitionOutlined />, label: "工艺管理" },
  { key: "/app/kanban", icon: <FundProjectionScreenOutlined />, label: "看板中心" },
  { type: "divider" as const },
  { key: "/app/intelligence", icon: <BulbOutlined />, label: "数据智能" },
  { key: "/app/commercial", icon: <ShopOutlined />, label: "商业化" },
  { key: "/app/implementation", icon: <RocketOutlined />, label: "实施管理" },
  { type: "divider" as const },
  { key: "/app/platform", icon: <ApiOutlined />, label: "平台配置" },
  { key: "/app/admin", icon: <SettingOutlined />, label: "系统管理" },
];

const titleMap: Record<string, string> = {
  "/app": "经营总览",
  "/app/orders": "订单履约",
  "/app/production": "生产执行",
  "/app/quality": "质量管理",
  "/app/materials": "物料仓储",
  "/app/equipment": "设备管理",
  "/app/process": "工艺管理",
  "/app/kanban": "看板中心",
  "/app/intelligence": "数据智能",
  "/app/commercial": "商业化",
  "/app/implementation": "实施管理",
  "/app/platform": "平台配置",
  "/app/admin": "系统管理",
};

export default function SaaSLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, login } = useAuthStore();
  const { snapshot, fetchSnapshot, sideCollapsed, setSideCollapsed } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchOptions, setSearchOptions] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [readEventIds, setReadEventIds] = useState<Set<string>>(new Set());

  useSSE();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchSnapshot();
  }, [user]);

  const userMenu = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: `${user?.name || ""} · ${user?.role || ""}`, disabled: true },
      { key: "plant", icon: <ShopOutlined />, label: user?.plant || "—", disabled: true },
      { type: "divider" as const },
      ...((snapshot?.users || []).filter((u) => u.id !== user?.id).slice(0, 5).map((u) => ({
        key: `switch-${u.id}`,
        icon: <UserOutlined />,
        label: `切换到 ${u.name}（${u.role}）`,
      }))),
      { type: "divider" as const },
      { key: "logout", icon: <LogoutOutlined />, label: "退出登录", danger: true },
    ],
    onClick: async ({ key }: { key: string }) => {
      if (key === "logout") { logout(); navigate("/login"); return; }
      if (key.startsWith("switch-")) {
        const uid = key.replace("switch-", "");
        const ok = await login(uid, "demo123");
        if (ok) { fetchSnapshot(true); navigate("/app"); }
      }
    },
  };

  const selectedKey = useMemo(() => {
    const matches = menuItems
      .filter((m) => m && (m as any).key)
      .map((m) => (m as any).key as string)
      .filter((k) => k && (k === "/app" ? location.pathname === "/app" : location.pathname.startsWith(k)))
      .sort((a, b) => b.length - a.length);
    return matches[0] || "/app";
  }, [location.pathname]);

  const breadcrumbItems = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const items: { title: any }[] = [{ title: <><HomeOutlined /> 工作台</> }];
    if (parts.length > 1) {
      const path = "/" + parts.slice(0, 2).join("/");
      items.push({ title: titleMap[path] || parts[1] });
    }
    if (parts.length > 2) {
      items.push({ title: parts[2] });
    }
    return items;
  }, [location.pathname]);

  const unreadEvents = (snapshot?.events || []).filter((e) => !readEventIds.has(e.id));
  const unreadCount = unreadEvents.length;

  const notifyDropdown = {
    items: [
      {
        key: "header",
        type: "group" as const,
        label: (
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Text strong>通知中心</Text>
            <Button type="link" size="small" onClick={(e) => {
              e.stopPropagation();
              setReadEventIds(new Set((snapshot?.events || []).map((ev) => ev.id)));
            }}>全部已读</Button>
          </Space>
        ),
      },
      ...((snapshot?.events || []).slice(0, 8).map((e) => ({
        key: e.id,
        label: (
          <div style={{ width: 320, padding: "4px 0", whiteSpace: "normal" }}>
            <Space size={6}>
              <Tag color={e.type === "系统" ? "default" : e.type === "生产" ? "green" : e.type === "质量" ? "red" : "blue"}>{e.type}</Tag>
              {!readEventIds.has(e.id) && <Badge status="processing" />}
            </Space>
            <div style={{ marginTop: 4, fontSize: 13 }}>{e.message}</div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{e.actor} · {e.time}</div>
          </div>
        ),
      }))),
      ...((snapshot?.events || []).length === 0 ? [{ key: "empty", label: <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }] : []),
    ],
  };

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchSearchOptions = (val: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) { setSearchOptions([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get("/search", { params: { q: val.trim() } });
        const groups: any[] = [];
        if ((data.orders || []).length) groups.push({
          label: <Text type="secondary" style={{ fontSize: 12 }}>工单</Text>,
          options: data.orders.map((o: any) => ({
            value: `order-${o.id}`,
            path: `/app/orders/${o.id}`,
            label: <Space><Tag color="green">工单</Tag><strong>{o.id}</strong>{o.customer} · {o.sku}</Space>,
          })),
        });
        if ((data.materials || []).length) groups.push({
          label: <Text type="secondary" style={{ fontSize: 12 }}>物料</Text>,
          options: data.materials.map((m: any) => ({
            value: `material-${m.id}`,
            path: `/app/materials`,
            label: <Space><Tag color="blue">物料</Tag><strong>{m.id}</strong>{m.name} · 库存 {m.stock}</Space>,
          })),
        });
        if ((data.quality || []).length) groups.push({
          label: <Text type="secondary" style={{ fontSize: 12 }}>质量偏差</Text>,
          options: data.quality.map((q: any) => ({
            value: `quality-${q.id}`,
            path: `/app/quality`,
            label: <Space><Tag color="orange">质量</Tag><strong>{q.id}</strong>{q.batch} · {q.severity}</Space>,
          })),
        });
        if ((data.equipment || []).length) groups.push({
          label: <Text type="secondary" style={{ fontSize: 12 }}>设备</Text>,
          options: data.equipment.map((e: any) => ({
            value: `equipment-${e.id}`,
            path: `/app/equipment`,
            label: <Space><Tag color="purple">设备</Tag><strong>{e.id}</strong>{e.name}</Space>,
          })),
        });
        setSearchOptions(groups);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleGlobalSearch = (val: string) => {
    if (!val.trim()) return;
    navigate(`/app/orders?keyword=${encodeURIComponent(val.trim())}`);
    setSearchKeyword("");
    setSearchOptions([]);
  };

  const handleSearchSelect = (_val: string, opt: any) => {
    if (opt?.path) navigate(opt.path);
    setSearchKeyword("");
    setSearchOptions([]);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={sideCollapsed}
        onCollapse={setSideCollapsed}
        breakpoint="lg"
        collapsedWidth={60}
        width={210}
        style={{ background: SIDER_BG }}
      >
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 16px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${PRIMARY}, #019966)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
            BY
          </div>
          {!sideCollapsed && <Text strong style={{ color: "#fff", marginLeft: 10, fontSize: 15, letterSpacing: 0.5 }}>白云智造</Text>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, background: SIDER_BG, marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", height: 56 }}>
          <Space size={12}>
            <Button type="text" icon={sideCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setSideCollapsed(!sideCollapsed)} />
            {snapshot?.tenant && <Text type="secondary" style={{ fontSize: 13 }}>{snapshot.tenant.name} · {snapshot.tenant.plan}</Text>}
          </Space>
          <Space size={16}>
            <AutoComplete
              value={searchKeyword}
              onChange={(v) => setSearchKeyword(v)}
              onSearch={fetchSearchOptions}
              onSelect={handleSearchSelect}
              options={searchOptions}
              style={{ width: 300 }}
              popupMatchSelectWidth={420}
              notFoundContent={searchLoading ? "加载中..." : (searchKeyword ? "无匹配结果" : null)}
            >
              <Input
                prefix={<SearchOutlined style={{ color: "#999" }} />}
                placeholder="搜索工单、物料、设备..."
                allowClear
                onPressEnter={(e) => handleGlobalSearch((e.target as HTMLInputElement).value)}
              />
            </AutoComplete>
            <Dropdown menu={notifyDropdown} placement="bottomRight" trigger={["click"]} overlayStyle={{ maxHeight: 480, overflow: "auto" }}>
              <Badge count={unreadCount} size="small" offset={[-4, 4]}>
                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
              </Badge>
            </Dropdown>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar style={{ background: PRIMARY }} size="small">{user?.name?.[0]}</Avatar>
                <Text style={{ fontSize: 13 }}>{user?.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 16, background: "#f5f7f6", borderRadius: 8, overflow: "auto" }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div style={{ padding: "8px 20px 20px" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
