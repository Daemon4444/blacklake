import { useEffect } from "react";
import { Card, Steps, Table, Tag, Button, Row, Col, Progress, Space, List } from "antd";
import { useAppStore } from "../../stores/useAppStore";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";

export default function Implementation() {
  const { snapshot, fetchSnapshot } = useAppStore();
  useEffect(() => { fetchSnapshot(); }, []);
  if (!snapshot) return null;
  const { implementationPhases, activationTasks, masterDataChecks, industryTemplates } = snapshot;
  const currentIdx = implementationPhases.findIndex((p) => p.status === "进行中");

  const advancePhase = async (id: string) => { await api.post(`/implementation/${id}/advance`); fetchSnapshot(); };
  const completeActivation = async (id: string) => { await api.post(`/activation/${id}/complete`); fetchSnapshot(); };
  const verifyMasterData = async (id: string) => { await api.post(`/master-data/${id}/verify`); fetchSnapshot(); };
  const applyTemplate = async (id: string) => { await api.post(`/templates/${id}/apply`); fetchSnapshot(); };

  return (
    <>
      <PageHeader title="实施管理" subtitle="7 步数字化转型路径 · 角色启用 · 主数据校验" extra={<Button onClick={() => fetchSnapshot(true)}>刷新</Button>} />

      <Card title="7 步数字化转型路径" style={{ marginBottom: 16 }}>
        <Steps current={currentIdx >= 0 ? currentIdx : 0} size="small" items={implementationPhases.map((p) => ({
          title: p.name, description: `${p.owner} · ${p.time}`,
          status: p.status === "已完成" ? "finish" as const : p.status === "进行中" ? "process" as const : "wait" as const,
        }))} />
        <Table dataSource={implementationPhases} rowKey="id" size="small" style={{ marginTop: 16 }} pagination={false} columns={[
          { title: "阶段", dataIndex: "name" },
          { title: "负责人", dataIndex: "owner", width: 100 },
          { title: "周期", dataIndex: "time", width: 90 },
          { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <StatusTag status={s} /> },
          { title: "操作", width: 90, render: (_: any, r: any) => r.status !== "已完成" && <Button size="small" onClick={() => advancePhase(r.id)}>推进</Button> },
        ]} />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="角色启用任务" size="small">
            <List dataSource={activationTasks} renderItem={(t) => (
              <List.Item actions={[t.status !== "已完成" && <Button size="small" onClick={() => completeActivation(t.id)}>完成</Button>].filter(Boolean) as any}>
                <List.Item.Meta title={<><StatusTag status={t.status} />{t.role}</>} description={t.firstAction} />
              </List.Item>
            )} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="主数据准备度" size="small">
            <Table dataSource={masterDataChecks} rowKey="id" size="small" pagination={false} columns={[
              { title: "域", dataIndex: "domain" },
              { title: "准备度", dataIndex: "readiness", width: 130, render: (v: number) => <Progress percent={v} size="small" strokeColor="#02b980" /> },
              { title: "异常", dataIndex: "issues", width: 60 },
              { title: "状态", dataIndex: "status", width: 80, render: (s: string) => <StatusTag status={s} /> },
              { title: "", width: 70, render: (_: any, r: any) => r.status !== "已校验" && <Button size="small" onClick={() => verifyMasterData(r.id)}>校验</Button> },
            ]} />
          </Card>
        </Col>
      </Row>

      <Card title="行业模板" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {industryTemplates.map((t) => (
            <Col xs={24} md={8} key={t.id}>
              <Card size="small" title={t.name} extra={<StatusTag status={t.status} />}
                actions={[t.status !== "已启用" && <Button type="link" onClick={() => applyTemplate(t.id)}>启用</Button>].filter(Boolean) as any}>
                <p style={{ margin: "4px 0" }}><strong>行业：</strong>{t.industry}</p>
                <p style={{ margin: "4px 0" }}><strong>适用：</strong>{t.fit}</p>
                <p style={{ margin: "4px 0" }}><strong>上线：</strong>{t.rollout}</p>
                <Space wrap>{t.modules.map((m) => <Tag key={m} color="green">{m}</Tag>)}</Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </>
  );
}
