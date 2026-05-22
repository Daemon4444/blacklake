import { useEffect, useState } from "react";
import { Card, Tag, Button, Row, Col, Input, Select, Space, Empty, message } from "antd";
import { FundProjectionScreenOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useAppStore } from "../../stores/useAppStore";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import StatusTag from "../../components/StatusTag";

export default function Kanban() {
  const { snapshot, fetchSnapshot } = useAppStore();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>();

  useEffect(() => { fetchSnapshot(); }, []);
  if (!snapshot) return null;

  const publishKanban = async (id: string) => { await api.post(`/kanban/${id}/publish`); message.success("已发布"); fetchSnapshot(); };

  const list = snapshot.kanbanBoards.filter((kb) => {
    if (keyword && !`${kb.id}${kb.name}${kb.audience}`.includes(keyword)) return false;
    if (status && kb.status !== status) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="看板中心"
        subtitle="多角色实时数字看板 · 已发布 / 草稿状态"
        extra={<Button icon={<ReloadOutlined />} onClick={() => fetchSnapshot(true)}>刷新</Button>}
      />

      <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 12 } }}>
        <Space wrap>
          <Input prefix={<SearchOutlined />} placeholder="看板名称 / 受众" allowClear value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ width: 240 }} />
          <Select placeholder="状态" allowClear value={status} onChange={setStatus} style={{ width: 120 }}
            options={["已发布","草稿"].map((s) => ({ value: s, label: s }))} />
        </Space>
      </Card>

      {list.length === 0 ? <Empty description="暂无看板" /> : (
        <Row gutter={[16, 16]}>
          {list.map((kb) => (
            <Col xs={24} md={12} lg={8} key={kb.id}>
              <Card
                title={<Space><FundProjectionScreenOutlined style={{ color: "#02b980" }} /> {kb.name}</Space>}
                extra={<StatusTag status={kb.status} />}
                actions={[kb.status !== "已发布" && <Button type="link" onClick={() => publishKanban(kb.id)}>发布</Button>].filter(Boolean) as any}
              >
                <p style={{ margin: "4px 0" }}><strong>受众：</strong>{kb.audience}</p>
                <p style={{ margin: "4px 0" }}><strong>范围：</strong>{kb.scope}</p>
                <p style={{ margin: "4px 0" }}><strong>刷新：</strong>{kb.refreshRate}</p>
                <p style={{ margin: "4px 0" }}><strong>布局：</strong>{kb.layout}</p>
                <p style={{ margin: "4px 0" }}><strong>负责人：</strong>{kb.owner}</p>
                {kb.lastPublished && <p style={{ margin: "4px 0", color: "#999", fontSize: 12 }}><strong>上次发布：</strong>{kb.lastPublished}</p>}
                <div style={{ marginTop: 8 }}>
                  <strong>组件：</strong>
                  <Space wrap style={{ marginTop: 4 }}>{kb.widgets.map((w) => <Tag key={w} color="green">{w}</Tag>)}</Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}
