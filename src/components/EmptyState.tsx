import type { ReactNode } from "react";
import { Empty } from "antd";

interface Props {
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ description = "暂无数据", action }: Props) {
  return (
    <div style={{ padding: "40px 0" }}>
      <Empty description={description} image={Empty.PRESENTED_IMAGE_SIMPLE}>
        {action}
      </Empty>
    </div>
  );
}
