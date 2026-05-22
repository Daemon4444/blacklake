import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message, Space, Row, Col, Radio, Tag } from "antd";
import { LockOutlined, LoginOutlined, ArrowLeftOutlined, UserOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../stores/useAuthStore";

const { Title, Text } = Typography;
const GREEN = "#02b980";

const demoUsers = [
  { id: "U-1001", name: "林计划", role: "计划员", desc: "排程与工单管理" },
  { id: "U-1002", name: "周总", role: "COO", desc: "经营总览与决策" },
  { id: "U-1003", name: "陈班长", role: "生产主管", desc: "产线执行与报工" },
  { id: "U-1004", name: "吴质检", role: "质量经理", desc: "质量检验与追溯" },
  { id: "U-1005", name: "何仓储", role: "仓储主管", desc: "物料出入库管理" },
  { id: "U-1006", name: "许 IT", role: "IT 顾问", desc: "系统配置与集成" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [userId, setUserId] = useState("U-1001");

  const handleLogin = async () => {
    const ok = await login(userId, "demo123");
    if (ok) { message.success("登录成功"); navigate("/app"); }
    else message.error("登录失败，请检查账号密码");
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, rgba(0,20,14,1) 0%, #00261a 40%, #003d2b 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 25% 30%, rgba(2,185,128,0.15) 0%, transparent 50%), radial-gradient(ellipse at 75% 70%, rgba(2,185,128,0.08) 0%, transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 1080, padding: "40px 24px" }}>
        <Row gutter={[48, 32]} align="middle">
          <Col xs={24} lg={12}>
            <Space size={10} style={{ marginBottom: 36 }}>
              <svg width="40" height="40" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill={GREEN} /><text x="32" y="42" textAnchor="middle" fontSize="24" fontFamily="system-ui" fontWeight="900" fill="white">BY</text></svg>
              <span style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>白云智造</span>
            </Space>
            <Title level={2} style={{ color: "#fff", fontWeight: 600, marginBottom: 16, lineHeight: 1.3 }}>
              云端制造协同<br />
              <span style={{ color: GREEN }}>从订单到交付的数字化平台</span>
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, fontWeight: 300, lineHeight: 1.8, display: "block" }}>
              登录工作台，体验从订单到交付的全链路数字化制造协同。
              六个演示角色，覆盖计划、生产、质量、仓储、运营、IT 全岗位视角。
            </Text>
            <div style={{ marginTop: 36, display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[{ n: "4000+", l: "服务工厂" }, { n: "9", l: "核心模块" }, { n: "4 周", l: "标准上线" }, { n: "99.9%", l: "可用性" }].map((s) => (
                <div key={s.l}>
                  <div style={{ color: GREEN, fontSize: 26, fontWeight: 700, letterSpacing: 0.5 }}>{s.n}</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 300, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 36, padding: "16px 18px", background: "rgba(2,185,128,0.06)", border: "1px solid rgba(2,185,128,0.18)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              <SafetyCertificateOutlined style={{ color: GREEN, marginRight: 8 }} />
              所有演示账号统一密码 <Text code style={{ color: GREEN, background: "rgba(2,185,128,0.12)" }}>demo123</Text>，登录即可一键体验各岗位视角。
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: 12, boxShadow: "0 24px 60px rgba(0,0,0,0.4)", border: "none" }} styles={{ body: { padding: 32 } }}>
              <Title level={4} style={{ marginBottom: 6, fontWeight: 600 }}>登录工作台</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>选择一个角色，体验对应岗位视角</Text>

              <Form layout="vertical" onFinish={handleLogin} style={{ marginTop: 20 }}>
                <Form.Item label={<Text strong>选择演示角色</Text>}>
                  <Radio.Group value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: "100%" }}>
                    <Row gutter={[10, 10]}>
                      {demoUsers.map((u) => (
                        <Col span={12} key={u.id}>
                          <Radio.Button value={u.id} style={{
                            width: "100%", height: "auto", padding: "10px 12px", borderRadius: 8,
                            display: "block", textAlign: "left", lineHeight: 1.4,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <UserOutlined style={{ color: userId === u.id ? GREEN : "#999" }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name} <Tag color="green" style={{ marginLeft: 4, fontSize: 10, lineHeight: "16px", padding: "0 4px" }}>{u.role}</Tag></div>
                                <div style={{ color: "#999", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.desc}</div>
                              </div>
                            </div>
                          </Radio.Button>
                        </Col>
                      ))}
                    </Row>
                  </Radio.Group>
                </Form.Item>
                <Form.Item label="密码">
                  <Input.Password size="large" defaultValue="demo123" prefix={<LockOutlined />} />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  icon={<LoginOutlined />}
                  style={{ height: 44, background: GREEN, borderColor: GREEN, fontWeight: 500 }}
                >
                  登录工作台
                </Button>
              </Form>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/")} style={{ color: "#999" }}>返回官网</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
