import { useNavigate } from "react-router-dom";
import { Button, Typography, Space, Row, Col, Card } from "antd";
import {
  RocketOutlined, SafetyCertificateOutlined, CloudOutlined,
  BarChartOutlined, ApiOutlined, ArrowRightOutlined,
  ThunderboltOutlined, BulbOutlined, ToolOutlined, PartitionOutlined,
  ClusterOutlined, NodeIndexOutlined, FundOutlined, AppstoreOutlined,
  PhoneOutlined, MailOutlined, EnvironmentOutlined, PlayCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const GREEN = "#02b980";
const DARK_BG = "rgba(0,20,14,1)";

const modules = [
  { icon: <BarChartOutlined />, title: "生产管理", desc: "工单下发、工序流转、扫码报工、异常上报，实时掌控全产线生产进度" },
  { icon: <ThunderboltOutlined />, title: "动态排程", desc: "产能负载可视化、AI 重排建议、插单影响评估，计划响应提速 50%" },
  { icon: <CloudOutlined />, title: "仓储管理", desc: "库位管理、齐套分析、安全库存预警、扫码出入库，消除缺料停线" },
  { icon: <SafetyCertificateOutlined />, title: "质量管理", desc: "来料检/首检/巡检/成品检，偏差闭环处理，批次正反向追溯" },
  { icon: <ToolOutlined />, title: "资源管理", desc: "设备台账、OEE 监控、点检保养计划、备件管理、IoT 数据接入" },
  { icon: <PartitionOutlined />, title: "工艺路线", desc: "多版本工艺路线、BOM 管理、SOP 绑定，标准化制造过程" },
  { icon: <NodeIndexOutlined />, title: "流程引擎", desc: "可视化流程配置、自动触发规则、多级审批，业务逻辑灵活编排" },
  { icon: <FundOutlined />, title: "数据智能平台", desc: "AI 异常归因、风险预警、ChatBI 问数，数据驱动制造决策" },
  { icon: <ClusterOutlined />, title: "工厂建模", desc: "多工厂、多产线、多车间组织架构建模，支撑集团级管控" },
];

const advantages = [
  { num: "4", unit: "周", label: "即可上线", desc: "云端快速部署，四周起完成实施上线" },
  { num: "1/10", unit: "", label: "传统 MES 费用", desc: "按需付费，无维护及升级费用" },
  { num: "4000", unit: "+", label: "制造企业", desc: "服务食品、制药、汽车、电子等行业" },
  { num: "200", unit: "+", label: "顶级工程师", desc: "来自 Google、SAP、西门子、阿里等" },
];

const customers = [
  { name: "大咖国际", role: "副总经理", quote: "引入白云智造系统是支撑公司战略落地的重要举措。仅用半年就实现了全工厂全环节的生产协同，整体生产运营效率、库存周转率都有明显提升。" },
  { name: "华润三九", role: "生产负责人", quote: "白云智造不仅满足了我们流程规范化管控的需求，还实现了各事业部与集团间生产信息的实时同步，单车间生产效率显著提升。" },
  { name: "农夫山泉", role: "运营总监", quote: "单工厂百余步流程精简，集团计划响应速度大幅提升——在全国 5 大水源地的近 30 家工厂，协同制造正在发生。" },
];

const differentiators = [
  { title: "四周即可上线", desc: "云端快速部署，无需本地服务器" },
  { title: "超高性价比", desc: "按需配置付费，只需传统 MES 十分之一费用" },
  { title: "按需灵活配置", desc: "功能模块及角色权限组件化，按需组合" },
  { title: "全局式协同", desc: "多工厂、多部门数据无缝衔接，实时同步" },
  { title: "便捷操作", desc: "界面简洁易上手，浏览器打开即用" },
  { title: "开放式接口", desc: "标准 OpenAPI，与 ERP/WMS 等系统对接" },
  { title: "专业级实施", desc: "资深专家上门调研，定制最佳方案" },
];

const secStyle = (bg = "#fff"): React.CSSProperties => ({ background: bg, padding: "80px 24px" });
const ctnStyle: React.CSSProperties = { maxWidth: 1200, margin: "0 auto" };

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#fff", fontWeight: 300 }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, height: 64, background: "rgba(0,20,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ ...ctnStyle, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <Space size={10} style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <svg width="32" height="32" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill={GREEN} /><text x="32" y="42" textAnchor="middle" fontSize="24" fontFamily="system-ui" fontWeight="900" fill="white">BY</text></svg>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 600, letterSpacing: 1 }}>白云智造</span>
          </Space>
          <Space size={4}>
            {[
              { label: "产品功能", id: "features" },
              { label: "解决方案", id: "solutions" },
              { label: "客户案例", id: "customers" },
              { label: "关于我们", id: "about" },
            ].map((t) => (
              <Button
                key={t.id}
                type="text"
                style={{ color: "rgba(255,255,255,0.85)", fontWeight: 300, fontSize: 14 }}
                onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                {t.label}
              </Button>
            ))}
            <Button style={{ marginLeft: 12, borderColor: GREEN, color: GREEN }} onClick={() => navigate("/login")}>登录</Button>
            <Button type="primary" style={{ background: GREEN, borderColor: GREEN }} onClick={() => navigate("/login")}>预约演示</Button>
          </Space>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 64, background: `linear-gradient(160deg, ${DARK_BG} 0%, #00261a 40%, #003d2b 100%)`, minHeight: 600, display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(2,185,128,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ ...ctnStyle, padding: "100px 24px 80px", position: "relative" }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={14}>
              <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 20, background: "rgba(2,185,128,0.15)", border: "1px solid rgba(2,185,128,0.3)", marginBottom: 24 }}>
                <Text style={{ color: GREEN, fontSize: 13, fontWeight: 400 }}>云原生 · SaaS · 制造协同系统</Text>
              </div>
              <Title style={{ color: "#fff", fontSize: 48, lineHeight: 1.15, marginBottom: 24, fontWeight: 600 }}>
                云端协同 <span style={{ color: GREEN }}>数据驱动</span>
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1.8, maxWidth: 540, marginBottom: 40, fontWeight: 300 }}>
                借助云计算、智能手机、IoT 设备，基于数据聚合、多角色协同、可视化分析、智能决策四大功能版块，用数据和算法帮助企业缩短生产周期、降低库存积压、提升产能利用率、透明化制造流程。
              </Paragraph>
              <Space size={16}>
                <Button type="primary" size="large" style={{ height: 48, paddingInline: 32, background: GREEN, borderColor: GREEN, fontWeight: 500 }} icon={<RocketOutlined />} onClick={() => navigate("/login")}>
                  免费体验工作台
                </Button>
                <Button size="large" ghost style={{ height: 48, paddingInline: 32, borderColor: "rgba(255,255,255,0.3)", color: "#fff", fontWeight: 400 }} icon={<PlayCircleOutlined />} onClick={() => navigate("/login")}>
                  观看产品介绍
                </Button>
              </Space>
            </Col>
            <Col xs={24} lg={10}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 40, border: "1px solid rgba(255,255,255,0.08)" }}>
                <Row gutter={[24, 32]}>
                  {advantages.map((a) => (
                    <Col span={12} key={a.label}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 42, fontWeight: 700, color: GREEN, lineHeight: 1 }}>{a.num}<span style={{ fontSize: 20, fontWeight: 400 }}>{a.unit}</span></div>
                        <div style={{ color: "#fff", fontSize: 15, marginTop: 4, fontWeight: 500 }}>{a.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{a.desc}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Slogan bar */}
      <div style={{ background: GREEN, padding: "20px 24px", textAlign: "center" }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: 400, letterSpacing: 2 }}>
          全新的数字化协同管理方式，应用于工厂订单、排程、物料、生产、质检、设备等各个场景
        </Text>
      </div>

      {/* Product Modules */}
      <section id="features" style={secStyle("#fff")}>
        <div style={ctnStyle}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Title level={2} style={{ fontWeight: 600, marginBottom: 8 }}>快速了解白云智造功能详情</Title>
            <Text style={{ fontSize: 16, color: "#666", fontWeight: 300 }}>覆盖制造全场景的九大核心模块</Text>
          </div>
          <Row gutter={[20, 20]}>
            {modules.map((m) => (
              <Col xs={24} sm={12} lg={8} key={m.title}>
                <Card hoverable style={{ height: "100%", borderRadius: 8, border: "1px solid #f0f0f0", transition: "all 0.3s" }} styles={{ body: { padding: 28 } }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(2,185,128,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: GREEN, marginBottom: 16 }}>
                    {m.icon}
                  </div>
                  <Title level={5} style={{ marginBottom: 8, fontWeight: 600 }}>{m.title}</Title>
                  <Text style={{ color: "#666", fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>{m.desc}</Text>
                  <div style={{ marginTop: 16 }}>
                    <Button type="link" style={{ padding: 0, color: GREEN, fontWeight: 400, fontSize: 13 }} onClick={() => navigate("/login")}>查看功能详情 <ArrowRightOutlined /></Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Why BlackLake */}
      <section id="solutions" style={secStyle("#f8faf9")}>
        <div style={ctnStyle}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Title level={2} style={{ fontWeight: 600, marginBottom: 8 }}>一旦上手使用白云智造，你就会忘掉那些 MES</Title>
            <Text style={{ fontSize: 16, color: "#666", fontWeight: 300 }}>小投入、大回报，收益超乎预期</Text>
          </div>
          <Row gutter={[16, 16]}>
            {differentiators.map((d, i) => (
              <Col xs={24} sm={12} lg={i < 4 ? 6 : 8} key={d.title}>
                <div style={{ padding: 24, background: "#fff", borderRadius: 8, height: "100%", borderLeft: `3px solid ${GREEN}` }}>
                  <Text strong style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>{d.title}</Text>
                  <Text style={{ color: "#666", fontSize: 13, fontWeight: 300 }}>{d.desc}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section id="customers" style={secStyle("#fff")}>
        <div style={ctnStyle}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Title level={2} style={{ fontWeight: 600, marginBottom: 8 }}>客户说</Title>
            <Text style={{ fontSize: 16, color: "#666", fontWeight: 300 }}>4000+ 制造企业的数字化合伙人</Text>
          </div>
          <Row gutter={[24, 24]}>
            {customers.map((c) => (
              <Col xs={24} lg={8} key={c.name}>
                <Card style={{ height: "100%", borderRadius: 8, border: "1px solid #f0f0f0" }} styles={{ body: { padding: 28 } }}>
                  <div style={{ fontSize: 32, color: GREEN, lineHeight: 1, marginBottom: 12 }}>&ldquo;</div>
                  <Paragraph style={{ color: "#333", fontSize: 14, lineHeight: 1.8, fontWeight: 300, minHeight: 80 }}>
                    {c.quote}
                  </Paragraph>
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                    <Text strong style={{ fontWeight: 600 }}>{c.name}</Text>
                    <Text style={{ color: "#999", marginLeft: 8, fontWeight: 300 }}>{c.role}</Text>
                  </div>
                  <Button type="link" style={{ padding: 0, marginTop: 8, color: GREEN, fontSize: 13 }} onClick={() => navigate("/login")}>了解详情 <ArrowRightOutlined /></Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Tech */}
      <section id="about" style={secStyle("#f8faf9")}>
        <div style={ctnStyle}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Title level={2} style={{ fontWeight: 600, marginBottom: 8 }}>我们的技术实力</Title>
          </div>
          <Row gutter={[24, 24]}>
            {[
              { icon: <AppstoreOutlined />, title: "云原生架构", desc: "容器化、Service Mesh 等先进互联网架构，结合低代码技术提供自定义能力，灵活适配差异化需求" },
              { icon: <SafetyCertificateOutlined />, title: "安全可靠", desc: "部署于主流云平台，全站安全防护、异地灾备、弹性扩容，确保数据机密性、完整性、可靠性" },
              { icon: <ApiOutlined />, title: "开放连接", desc: "标准 OpenAPI 接口，高效打通供应链、生产、物流、销售各系统" },
            ].map((t) => (
              <Col xs={24} lg={8} key={t.title}>
                <div style={{ textAlign: "center", padding: 32 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: GREEN, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", marginBottom: 20 }}>
                    {t.icon}
                  </div>
                  <Title level={4} style={{ fontWeight: 600, marginBottom: 8 }}>{t.title}</Title>
                  <Text style={{ color: "#666", fontSize: 14, fontWeight: 300, lineHeight: 1.8 }}>{t.desc}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(160deg, ${DARK_BG} 0%, #003d2b 100%)`, padding: "80px 24px", textAlign: "center" }}>
        <Title level={2} style={{ color: "#fff", fontWeight: 600, marginBottom: 12 }}>开启制造数字化转型</Title>
        <Paragraph style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 500, margin: "0 auto 40px", fontWeight: 300 }}>
          预约产品演示，获取专属的首厂试点方案和 ROI 测算
        </Paragraph>
        <Space size={16}>
          <Button type="primary" size="large" style={{ height: 48, paddingInline: 32, background: GREEN, borderColor: GREEN, fontWeight: 500 }} icon={<RocketOutlined />} onClick={() => navigate("/login")}>
            免费体验
          </Button>
          <Button size="large" ghost style={{ height: 48, paddingInline: 32, borderColor: "rgba(255,255,255,0.3)", color: "#fff" }} onClick={() => navigate("/login")}>
            联系销售 400-921-0816
          </Button>
        </Space>
      </section>

      {/* Footer */}
      <footer style={{ background: DARK_BG, padding: "60px 24px 32px" }}>
        <div style={ctnStyle}>
          <Row gutter={[48, 32]}>
            <Col xs={24} sm={12} lg={5}>
              <Space size={8} style={{ marginBottom: 16 }}>
                <svg width="28" height="28" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill={GREEN} /><text x="32" y="42" textAnchor="middle" fontSize="24" fontFamily="system-ui" fontWeight="900" fill="white">BY</text></svg>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>白云智造</span>
              </Space>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 300, lineHeight: 2 }}>
                <div><PhoneOutlined /> 400-921-0816</div>
                <div><MailOutlined /> contact@baiyun-saas.cn</div>
                <div><EnvironmentOutlined /> 上海市长宁区</div>
              </div>
            </Col>
            {[
              { title: "产品功能", items: ["生产管理", "质量管理", "物料管理", "设备管理", "动态排程"] },
              { title: "解决方案", items: ["食品饮料", "制药", "汽车零部件", "电子制造", "新能源"] },
              { title: "关于白云", items: ["企业简介", "客户案例", "最新动态", "加入我们"] },
              { title: "支持", items: ["帮助中心", "API 文档", "系统状态", "安全合规"] },
            ].map((g) => (
              <Col xs={12} sm={6} lg={4} key={g.title}>
                <Text strong style={{ color: "#fff", display: "block", marginBottom: 16, fontSize: 14 }}>{g.title}</Text>
                {g.items.map((item) => (
                  <div key={item}><Button type="link" style={{ color: "rgba(255,255,255,0.5)", padding: "2px 0", fontSize: 13, fontWeight: 300 }} onClick={() => navigate("/login")}>{item}</Button></div>
                ))}
              </Col>
            ))}
          </Row>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 40, paddingTop: 20, textAlign: "center" }}>
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 300 }}>
              © 2026 白云智造 BaiYun Technologies
            </Text>
          </div>
        </div>
      </footer>
    </div>
  );
}
