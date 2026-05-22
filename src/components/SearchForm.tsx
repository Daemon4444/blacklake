import { useState } from "react";
import { Form, Input, Select, DatePicker, Button, Space, Row, Col } from "antd";
import { SearchOutlined, ReloadOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";

export interface SearchField {
  name: string;
  label: string;
  type: "input" | "select" | "dateRange";
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

interface Props {
  fields: SearchField[];
  onSearch: (values: Record<string, any>) => void;
  onReset?: () => void;
  defaultExpanded?: boolean;
}

export default function SearchForm({ fields, onSearch, onReset, defaultExpanded = true }: Props) {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const visibleFields = expanded ? fields : fields.slice(0, 3);

  const handleReset = () => {
    form.resetFields();
    onReset?.();
    onSearch({});
  };

  return (
    <Form form={form} layout="horizontal" onFinish={onSearch} style={{ marginBottom: 16 }}>
      <Row gutter={[16, 8]}>
        {visibleFields.map((f) => (
          <Col xs={24} sm={12} md={8} lg={6} key={f.name}>
            <Form.Item name={f.name} label={f.label} style={{ marginBottom: 8 }}>
              {f.type === "input" && <Input placeholder={f.placeholder || `请输入${f.label}`} allowClear />}
              {f.type === "select" && <Select options={f.options} placeholder={f.placeholder || "请选择"} allowClear />}
              {f.type === "dateRange" && <DatePicker.RangePicker style={{ width: "100%" }} />}
            </Form.Item>
          </Col>
        ))}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space style={{ marginTop: 0 }}>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">搜索</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            {fields.length > 3 && (
              <Button type="link" onClick={() => setExpanded(!expanded)}>
                {expanded ? <>收起 <UpOutlined /></> : <>展开 <DownOutlined /></>}
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Form>
  );
}
