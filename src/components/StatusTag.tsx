import { Tag } from "antd";

const COLOR: Record<string, string> = {
  // work order
  "正常": "green",
  "风险": "orange",
  "阻塞": "red",
  "完成": "blue",
  "已完成": "green",
  // quality
  "待处理": "orange",
  "处理中": "processing",
  "已关闭": "default",
  // equipment
  "运行": "green",
  "告警": "orange",
  "保养中": "blue",
  "停机": "red",
  "待料": "orange",
  // others
  "已发布": "green",
  "变更中": "blue",
  "草稿": "default",
  "在线": "green",
  "离线": "default",
  "已连接": "green",
  "未连接": "default",
  "进行中": "blue",
  "待开始": "default",
  "已校验": "green",
  "未校验": "orange",
  "已采纳": "green",
  "已启用": "green",
  "可启用": "default",
  "已转实施": "green",
  "售前方案": "blue",
};

interface Props {
  status?: string;
  label?: string;
}

export default function StatusTag({ status, label }: Props) {
  if (!status) return null;
  return <Tag color={COLOR[status] || "default"}>{label || status}</Tag>;
}

export function getStatusColor(status: string) {
  return COLOR[status] || "default";
}
