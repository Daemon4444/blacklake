import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import api from "../../services/api";
import type { WorkOrder } from "../../types";

interface Props {
  open: boolean;
  record?: WorkOrder | null;
  lines: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({ open, record, lines, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const isEdit = !!record;

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          ...record,
          due: record.due ? dayjs(record.due, "YYYY-MM-DD") : null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ priority: "P2", status: "正常", progress: 0 });
      }
    }
  }, [open, record]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        due: values.due ? values.due.format("YYYY-MM-DD") : "",
        progress: Number(values.progress) || 0,
        blockers: [],
      };
      if (isEdit && record) {
        await api.put(`/orders/${record.id}`, payload);
        message.success("工单已更新");
      } else {
        await api.post("/orders", payload);
        message.success("工单已创建");
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.error || "操作失败");
    }
  };

  return (
    <Modal
      title={isEdit ? `编辑工单 ${record?.id}` : "新建工单"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      width={640}
      destroyOnHidden
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item name="customer" label="客户" rules={[{ required: true, message: "请输入客户名称" }]}>
          <Input placeholder="请输入客户名称" />
        </Form.Item>
        <Form.Item name="sku" label="SKU / 产品" rules={[{ required: true, message: "请输入 SKU" }]}>
          <Input placeholder="如：电池模组 v2" />
        </Form.Item>
        <Form.Item name="line" label="产线" rules={[{ required: true, message: "请选择产线" }]}>
          <Select
            placeholder="请选择产线"
            options={lines.map((l) => ({ value: l.id, label: `${l.id} · ${l.name}` }))}
          />
        </Form.Item>
        <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
          <Select options={[
            { value: "P0", label: "P0 - 紧急" },
            { value: "P1", label: "P1 - 高" },
            { value: "P2", label: "P2 - 中" },
          ]} />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true }]}>
          <Select options={["正常", "风险", "阻塞", "完成"].map((s) => ({ value: s, label: s }))} />
        </Form.Item>
        <Form.Item name="progress" label="进度（%）">
          <InputNumber min={0} max={100} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="due" label="计划交付日期">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
