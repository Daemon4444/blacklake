import { useEffect } from "react";
import { Card, Table, Tag, Button, Row, Col, Space, Divider } from "antd";
import { useAppStore } from "../../stores/useAppStore";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";

export default function Commercial() {
  const { snapshot, fetchSnapshot } = useAppStore();
  useEffect(() => { fetchSnapshot(); }, []);
  if (!snapshot) return null;
  const { commercialPackages, salesOpportunities } = snapshot;

  const createPlan = async (id: string) => { await api.post(`/commercial/${id}/plan`); fetchSnapshot(); };
  const convert = async (id: string) => { await api.post(`/opportunities/${id}/convert`); fetchSnapshot(); };

  return (
    <>
      <PageHeader title="商业化管理" subtitle="标准产品包 · 销售商机 · 转实施" extra={<Button onClick={() => fetchSnapshot(true)}>刷新</Button>} />

      <Row gutter={[16, 16]}>
        {commercialPackages.map((pkg) => (
          <Col xs={24} md={8} key={pkg.id}>
            <Card title={pkg.name} extra={<Tag color={pkg.status === "主推" ? "green" : "default"}>{pkg.status}</Tag>}
              actions={[<Button type="link" onClick={() => createPlan(pkg.id)}>生成售前方案</Button>]}>
              <p style={{ margin: "4px 0" }}><strong>目标客户：</strong>{pkg.target}</p>
              <p style={{ margin: "4px 0" }}><strong>价格模型：</strong>{pkg.priceModel}</p>
              <p style={{ margin: "4px 0" }}><strong>范围：</strong>{pkg.scope}</p>
              <p style={{ margin: "4px 0" }}><strong>实施：</strong>{pkg.implementation}</p>
              <p style={{ margin: "4px 0" }}><strong>ROI：</strong>{pkg.roi}</p>
              <Divider style={{ margin: "12px 0" }} />
              <Space wrap>{pkg.modules.map((m) => <Tag key={m} color="green">{m}</Tag>)}</Space>
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="销售商机" style={{ marginTop: 16 }}>
        <Table dataSource={salesOpportunities} rowKey="id" size="small" columns={[
          { title: "商机号", dataIndex: "id", width: 150 },
          { title: "客户", dataIndex: "customer" },
          { title: "阶段", dataIndex: "stage" },
          { title: "下一步", dataIndex: "nextStep", ellipsis: true },
          { title: "状态", dataIndex: "status", width: 100, render: (s: string) => <StatusTag status={s} /> },
          { title: "操作", width: 100, render: (_: any, r: any) => r.status !== "已转实施" && <Button size="small" type="primary" onClick={() => convert(r.id)}>转实施</Button> },
        ]} />
      </Card>
    </>
  );
}
