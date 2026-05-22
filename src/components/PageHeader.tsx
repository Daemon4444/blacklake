import type { ReactNode } from "react";
import { Typography, Space } from "antd";

const { Title, Text } = Typography;

interface Props {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export default function PageHeader({ title, subtitle, extra }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
      <div>
        <Title level={4} style={{ margin: 0, fontWeight: 600 }}>{title}</Title>
        {subtitle && <Text type="secondary" style={{ fontSize: 13 }}>{subtitle}</Text>}
      </div>
      {extra && <Space wrap>{extra}</Space>}
    </div>
  );
}
