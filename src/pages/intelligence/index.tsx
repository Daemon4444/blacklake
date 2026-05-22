import { useEffect } from "react";
import { Card, Table, Tag, Button, Row, Col, Statistic, List, Typography } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { useAppStore } from "../../stores/useAppStore";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";

const { Text } = Typography;

export default function Intelligence() {
  const { snapshot, fetchSnapshot } = useAppStore();
  useEffect(() => { fetchSnapshot(); }, []);
  if (!snapshot) return null;
  const { intelligenceInsights, recommendations } = snapshot;
  const pending = intelligenceInsights.filter((i) => i.status === "待处理");

  const resolveInsight = async (id: string) => { await api.post(`/insights/${id}/resolve`); fetchSnapshot(); };
  const executeRec = async (id: string) => { await api.post(`/recommendations/${id}/execute`); fetchSnapshot(); };

  return (
    <>
      <PageHeader title="数据智能" subtitle="AI 洞察 · 智能建议 · 处理闭环" extra={<Button onClick={() => fetchSnapshot(true)}>刷新</Button>} />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="洞察总数" value={intelligenceInsights.length} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="待处理" value={pending.length} valueStyle={{ color: pending.length > 0 ? "#cf1322" : "#02b980" }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="AI 建议" value={recommendations.length} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="已采纳" value={recommendations.filter((r) => r.accepted).length} valueStyle={{ color: "#02b980" }} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="智能洞察">
            <Table dataSource={intelligenceInsights} rowKey="id" size="small" columns={[
              { title: "标题", dataIndex: "title", ellipsis: true },
              { title: "领域", dataIndex: "domain", width: 80, render: (d: string) => <Tag color="green">{d}</Tag> },
              { title: "严重度", dataIndex: "severity", width: 80, render: (s: string) => <Tag color={s === "高" ? "red" : "orange"}>{s}</Tag> },
              { title: "指标", dataIndex: "metric", width: 90 },
              { title: "值", dataIndex: "value", width: 70 },
              { title: "变化", dataIndex: "change", width: 70, render: (c: string) => <Text type={c.startsWith("-") ? "danger" : "success"}>{c}</Text> },
              { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <StatusTag status={s} /> },
              { title: "操作", width: 80, render: (_: any, r: any) => r.status !== "已处理" && <Button size="small" onClick={() => resolveInsight(r.id)}>处理</Button> },
            ]} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><ThunderboltOutlined /> AI 建议</>}>
            <List dataSource={recommendations} renderItem={(r) => (
              <List.Item actions={[!r.accepted && <Button size="small" type="primary" onClick={() => executeRec(r.id)}>执行</Button>].filter(Boolean) as any}>
                <List.Item.Meta title={<>{r.accepted ? <Tag color="green">已采纳</Tag> : <Tag color={r.severity === "高" ? "red" : "orange"}>{r.severity}</Tag>}{r.title}</>} description={<><div>{r.body}</div><Text type="secondary">影响：{r.impact}</Text></>} />
              </List.Item>
            )} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
