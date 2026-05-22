import { useEffect } from "react";
import { Card, Table, Tag, Button, Switch, Steps, Tabs, Badge } from "antd";
import { useAppStore } from "../../stores/useAppStore";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";

export default function Platform() {
  const { snapshot, fetchSnapshot } = useAppStore();
  useEffect(() => { fetchSnapshot(); }, []);
  if (!snapshot) return null;
  const { rules, integrations, workflowInstances } = snapshot;

  const toggleRule = async (id: string) => { await api.post(`/rules/${id}/toggle`); fetchSnapshot(); };
  const syncInteg = async (id: string) => { await api.post(`/integrations/${id}/sync`); fetchSnapshot(); };
  const advanceWf = async (id: string) => { await api.post(`/workflows/${id}/advance`); fetchSnapshot(); };

  return (
    <>
      <PageHeader title="平台配置" subtitle="规则引擎 · 集成管理 · 流程引擎" extra={<Button onClick={() => fetchSnapshot(true)}>刷新</Button>} />

      <Tabs items={[
        { key: "rules", label: "规则引擎", children: (
          <Card>
            <Table dataSource={rules} rowKey="id" size="small" columns={[
              { title: "规则名称", dataIndex: "name" },
              { title: "模块", dataIndex: "module", width: 110, render: (m: string) => <Tag color="green">{m}</Tag> },
              { title: "阈值", dataIndex: "threshold" },
              { title: "状态", dataIndex: "enabled", width: 80, render: (v: boolean, r: any) => <Switch checked={v} onChange={() => toggleRule(r.id)} size="small" /> },
            ]} />
          </Card>
        )},
        { key: "integrations", label: "集成管理", children: (
          <Card>
            <Table dataSource={integrations} rowKey="id" size="small" columns={[
              { title: "系统", dataIndex: "name" },
              { title: "类型", dataIndex: "type", width: 100, render: (t: string) => <Tag color="green">{t}</Tag> },
              { title: "状态", dataIndex: "status", width: 100, render: (s: string) => <Badge status={s === "已连接" ? "success" : "default"} text={s} /> },
              { title: "上次同步", dataIndex: "lastSync", width: 110 },
              { title: "操作", width: 90, render: (_: any, r: any) => <Button size="small" onClick={() => syncInteg(r.id)}>同步</Button> },
            ]} />
          </Card>
        )},
        { key: "workflows", label: "流程引擎", children: (
          <Card>
            {workflowInstances.map((wf) => (
              <Card key={wf.id} size="small" title={wf.name} extra={<StatusTag status={wf.status} />} style={{ marginBottom: 12 }}>
                <p style={{ margin: "4px 0" }}><strong>类别：</strong>{wf.category} | <strong>业务键：</strong>{wf.businessKey} | <strong>SLA：</strong>{wf.sla} | <strong>路由：</strong>{wf.route}</p>
                <Steps current={wf.currentStep} size="small" items={wf.steps.map((s) => ({ title: s }))} />
                {wf.status !== "已完成" && <Button size="small" type="primary" style={{ marginTop: 12 }} onClick={() => advanceWf(wf.id)}>推进</Button>}
              </Card>
            ))}
          </Card>
        )},
      ]} />
    </>
  );
}
