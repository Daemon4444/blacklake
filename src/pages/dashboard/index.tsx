import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Statistic, Table, Tag, List, Typography, Button, Space, Progress, Alert, DatePicker, Skeleton } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined, CheckCircleOutlined, ThunderboltOutlined, RiseOutlined, DashboardOutlined } from "@ant-design/icons";
import { useAppStore } from "../../stores/useAppStore";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";

const { Text } = Typography;
const PRIMARY = "#02b980";

// 简易 SVG 柱状图：最近 7 天产量
function SimpleBarChart({ data, max }: { data: { label: string; value: number }[]; max: number }) {
  const W = 560, H = 180, padL = 30, padB = 24, padT = 10;
  const innerW = W - padL - 10, innerH = H - padB - padT;
  const barW = innerW / data.length * 0.6;
  const step = innerW / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 180 }}>
      {[0, 0.5, 1].map((p) => (
        <line key={p} x1={padL} y1={padT + innerH * (1 - p)} x2={W - 10} y2={padT + innerH * (1 - p)} stroke="#eee" />
      ))}
      {data.map((d, i) => {
        const h = max ? (d.value / max) * innerH : 0;
        const x = padL + step * i + (step - barW) / 2;
        const y = padT + innerH - h;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={h} fill={PRIMARY} rx={4} />
            <text x={x + barW / 2} y={y - 4} fontSize="10" textAnchor="middle" fill="#666">{d.value}</text>
            <text x={x + barW / 2} y={H - 6} fontSize="10" textAnchor="middle" fill="#999">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// 简易 SVG 折线图：质量合格率趋势
function SimpleLineChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 560, H = 180, padL = 30, padB = 24, padT = 10;
  const innerW = W - padL - 10, innerH = H - padB - padT;
  const max = 100, min = Math.max(0, Math.min(...data.map((d) => d.value)) - 5);
  const range = max - min || 1;
  const step = innerW / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => [padL + step * i, padT + innerH - ((d.value - min) / range) * innerH] as [number, number]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0]} ${padT + innerH} L ${pts[0][0]} ${padT + innerH} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 180 }}>
      {[0, 0.5, 1].map((p) => (
        <line key={p} x1={padL} y1={padT + innerH * (1 - p)} x2={W - 10} y2={padT + innerH * (1 - p)} stroke="#eee" />
      ))}
      <path d={area} fill={PRIMARY} fillOpacity={0.12} />
      <path d={path} stroke={PRIMARY} strokeWidth={2} fill="none" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={3.5} fill="#fff" stroke={PRIMARY} strokeWidth={2} />
          <text x={p[0]} y={p[1] - 8} fontSize="10" textAnchor="middle" fill="#666">{data[i].value}</text>
          <text x={p[0]} y={H - 6} fontSize="10" textAnchor="middle" fill="#999">{data[i].label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { snapshot, fetchSnapshot } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchSnapshot().finally(() => setLoading(false));
  }, []);

  const trendData = useMemo(() => {
    // 基于 orders 数量和 progress 推断 7 天产量演示数据
    const base = snapshot?.orders?.length || 8;
    const seed = Math.max(40, base * 12);
    return ["周一","周二","周三","周四","周五","周六","周日"].map((d, i) => ({
      label: d,
      value: Math.round(seed * (0.7 + Math.sin(i * 1.1) * 0.18 + (i / 18))),
    }));
  }, [snapshot]);

  const qualityTrend = useMemo(() => {
    const issues = snapshot?.qualityIssues?.length || 0;
    const baseline = Math.max(85, 99 - issues);
    return ["周一","周二","周三","周四","周五","周六","周日"].map((d, i) => ({
      label: d,
      value: Math.min(100, baseline + Math.round(Math.cos(i * 0.7) * 3) + (i % 3)),
    }));
  }, [snapshot]);

  if (loading || !snapshot) {
    return (
      <>
        <PageHeader title="经营总览" subtitle="多工厂 · 多产线实时态势" />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={12} sm={6} key={i}><Card><Skeleton active paragraph={{ rows: 1 }} /></Card></Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={16}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
          <Col xs={24} lg={8}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
        </Row>
      </>
    );
  }

  const { orders, materials, qualityIssues, lines, recommendations, events } = snapshot;
  const riskOrders = orders.filter((o) => o.status === "风险" || o.status === "阻塞");
  const lowStock = materials.filter((m) => m.stock < m.safeStock);
  const openQuality = qualityIssues.filter((q) => q.status !== "已关闭");
  const avgOee = lines.length ? Math.round(lines.reduce((s, l) => s + l.oee, 0) / lines.length) : 0;
  const completeRate = orders.length ? Math.round((orders.filter((o) => o.status === "完成").length / orders.length) * 100) : 0;
  const todayOutput = trendData[trendData.length - 1].value;
  const yesterdayOutput = trendData[trendData.length - 2].value;
  const outputChange = yesterdayOutput ? Math.round(((todayOutput - yesterdayOutput) / yesterdayOutput) * 100) : 0;

  const executeRec = async (id: string) => { await api.post(`/recommendations/${id}/execute`); fetchSnapshot(); };

  return (
    <>
      <PageHeader
        title="经营总览"
        subtitle={`${snapshot.tenant?.name || ""} · 多工厂多产线实时态势`}
        extra={
          <>
            <DatePicker.RangePicker style={{ width: 260 }} placeholder={["开始日期", "结束日期"]} />
            <Button onClick={() => fetchSnapshot(true)}>刷新</Button>
          </>
        }
      />

      {/* 风险队列 */}
      {riskOrders.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`检测到 ${riskOrders.length} 条风险/阻塞工单，建议立即处理`}
          description={
            <Space wrap>
              {riskOrders.slice(0, 3).map((o) => (
                <Tag key={o.id} color={o.status === "阻塞" ? "red" : "orange"} style={{ cursor: "pointer" }} onClick={() => navigate(`/app/orders/${o.id}`)}>{o.id} · {o.customer}</Tag>
              ))}
              {riskOrders.length > 3 && <Tag>+{riskOrders.length - 3}</Tag>}
            </Space>
          }
          action={<Button size="small" type="primary" onClick={() => navigate("/app/orders?status=" + encodeURIComponent("风险"))}>立即处理</Button>}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="工单总数"
              value={orders.length}
              suffix="条"
              prefix={<RiseOutlined style={{ color: PRIMARY }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>完成率 {completeRate}%</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="风险/阻塞"
              value={riskOrders.length}
              valueStyle={{ color: riskOrders.length > 0 ? "#cf1322" : PRIMARY }}
              prefix={riskOrders.length > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>较昨日 {riskOrders.length > 0 ? "↑" : "—"}</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="平均 OEE"
              value={avgOee}
              suffix="%"
              valueStyle={{ color: avgOee >= 80 ? PRIMARY : "#fa8c16" }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {avgOee >= 80 ? <><ArrowUpOutlined style={{ color: PRIMARY }} /> 达标</> : <><ArrowDownOutlined style={{ color: "#fa8c16" }} /> 低于目标 80%</>}
            </Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="缺料预警"
              value={lowStock.length}
              suffix="项"
              valueStyle={{ color: lowStock.length > 0 ? "#fa8c16" : PRIMARY }}
              prefix={lowStock.length > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>开放质量 {openQuality.length} 项</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="近 7 天产量趋势" size="small" extra={
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>今日</Text>
              <Text strong style={{ color: PRIMARY }}>{todayOutput}</Text>
              {outputChange >= 0
                ? <Text style={{ color: PRIMARY, fontSize: 12 }}><ArrowUpOutlined /> {outputChange}%</Text>
                : <Text style={{ color: "#cf1322", fontSize: 12 }}><ArrowDownOutlined /> {Math.abs(outputChange)}%</Text>}
            </Space>
          }>
            <SimpleBarChart data={trendData} max={Math.max(...trendData.map((d) => d.value)) * 1.15} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><DashboardOutlined /> 平均 OEE</>} size="small">
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <Progress
                type="dashboard"
                percent={avgOee}
                strokeColor={avgOee >= 80 ? PRIMARY : "#fa8c16"}
                size={160}
                format={(v) => <span style={{ fontSize: 28, fontWeight: 600 }}>{v}%</span>}
              />
              <div style={{ marginTop: 12, color: "#666" }}>
                目标：80% · {lines.length} 条产线
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="质量合格率趋势" size="small">
            <SimpleLineChart data={qualityTrend} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><ThunderboltOutlined /> AI 建议</>} size="small" styles={{ body: { maxHeight: 240, overflow: "auto" } }}>
            <List
              dataSource={recommendations.filter((r) => !r.accepted).slice(0, 5)}
              locale={{ emptyText: "暂无待处理建议" }}
              renderItem={(r) => (
                <List.Item actions={[<Button size="small" type="primary" onClick={() => executeRec(r.id)}>执行</Button>]}>
                  <List.Item.Meta
                    title={<><Tag color={r.severity === "高" ? "red" : r.severity === "中" ? "orange" : "blue"}>{r.severity}</Tag>{r.title}</>}
                    description={<Text style={{ fontSize: 12 }}>{r.body}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="产线状态" size="small">
            <Table dataSource={lines} rowKey="id" size="small" pagination={false} columns={[
              { title: "产线", dataIndex: "name" },
              { title: "工厂", dataIndex: "plant", width: 100 },
              { title: "状态", dataIndex: "status", width: 80, render: (s: string) => <StatusTag status={s} /> },
              { title: "OEE", dataIndex: "oee", width: 160, render: (v: number) => <Progress percent={v} size="small" strokeColor={v >= 80 ? PRIMARY : "#fa8c16"} /> },
              { title: "负载", dataIndex: "load", width: 70, render: (v: number) => `${v}%` },
            ]} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="实时事件" size="small" styles={{ body: { maxHeight: 320, overflow: "auto" } }}>
            <List dataSource={events.slice(0, 12)} size="small" renderItem={(e) => (
              <List.Item><Text type="secondary" style={{ marginRight: 8, fontSize: 12 }}>{e.time}</Text><Tag>{e.type}</Tag>{e.message}</List.Item>
            )} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
