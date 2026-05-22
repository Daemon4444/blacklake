import { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Tree, Steps, Row, Col, Form, Input, Select, Space, Empty, message } from "antd";
import { PartitionOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useAppStore } from "../../stores/useAppStore";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";

export default function Process() {
  const { snapshot, fetchSnapshot } = useAppStore();
  const [filters, setFilters] = useState<{ keyword?: string; status?: string }>({});
  const [form] = Form.useForm();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { fetchSnapshot(); }, []);
  if (!snapshot) return null;

  const publishRoute = async (id: string) => { await api.post(`/routes/${id}/publish`); message.success("已发布"); fetchSnapshot(); };

  const routes = snapshot.processRoutes.filter((r) => {
    if (filters.keyword && !`${r.id}${r.product}${r.line}`.includes(filters.keyword)) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });

  const selected = snapshot.processRoutes.find((r) => r.id === (selectedId || routes[0]?.id));

  const bomTreeData = selected ? (selected.bom || []).map((b: any, i: number) => ({
    title: <span><Tag color="green">{b.id}</Tag> {b.material} <span style={{ color: "#999", fontSize: 12 }}>· {b.qty}{b.uom} · 损耗 {b.scrap}</span></span>,
    key: `${selected.id}-bom-${i}`,
  })) : [];

  return (
    <>
      <PageHeader
        title="工艺管理"
        subtitle="工艺路线 · BOM 物料树 · 工序步骤"
        extra={<Button icon={<ReloadOutlined />} onClick={() => fetchSnapshot(true)}>刷新</Button>}
      />

      <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 0 } }}>
        <Form form={form} layout="inline" onFinish={() => setFilters(form.getFieldsValue())}>
          <Form.Item name="keyword">
            <Input prefix={<SearchOutlined />} placeholder="路线号 / 产品 / 产线" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 130 }}
              options={["已发布","变更中","草稿"].map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button onClick={() => { form.resetFields(); setFilters({}); }}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={<><PartitionOutlined /> 工艺路线</>}>
            <Table dataSource={routes} rowKey="id" size="small"
              pagination={{ pageSize: 8 }}
              onRow={(r) => ({ onClick: () => setSelectedId(r.id), style: { cursor: "pointer" } })}
              rowClassName={(r) => (selectedId || routes[0]?.id) === r.id ? "ant-table-row-selected" : ""}
              columns={[
                { title: "路线号", dataIndex: "id", width: 90 },
                { title: "产品", dataIndex: "product" },
                { title: "版本", dataIndex: "version", width: 70 },
                { title: "产线", dataIndex: "line", width: 80 },
                { title: "节拍", dataIndex: "cycleTime", width: 90 },
                { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <StatusTag status={s} /> },
                { title: "操作", width: 80, render: (_: any, r: any) => r.status !== "已发布" && <Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); publishRoute(r.id); }}>发布</Button> },
              ]} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={selected ? `BOM · ${selected.id}` : "BOM"} size="small">
            {selected ? <Tree treeData={bomTreeData} defaultExpandAll selectable={false} /> : <Empty description="请选择一条工艺路线" />}
          </Card>
        </Col>
      </Row>

      {selected && (
        <Card title={`工序步骤 · ${selected.product} ${selected.version}`} style={{ marginTop: 16 }}>
          <Steps current={(selected.steps || []).findIndex((s: any) => s.status !== "已发布") < 0 ? (selected.steps || []).length - 1 : (selected.steps || []).findIndex((s: any) => s.status !== "已发布")}
            items={(selected.steps || []).map((s: any) => ({ title: s.name, description: `${s.station || ""} · ${s.equipment || ""}` }))} />
          <Table style={{ marginTop: 16 }} dataSource={selected.steps || []} rowKey="sequence" size="small" pagination={false} columns={[
            { title: "序号", dataIndex: "sequence", width: 60 },
            { title: "工序", dataIndex: "name" },
            { title: "工位", dataIndex: "station" },
            { title: "设备", dataIndex: "equipment" },
            { title: "质检点", dataIndex: "qualityGate" },
            { title: "SOP", dataIndex: "sop" },
            { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <StatusTag status={s} /> },
          ]} />
        </Card>
      )}
    </>
  );
}
