import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyStatic from "@fastify/static";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { compareSync } from "bcryptjs";

const prisma = new PrismaClient();
const app = Fastify({ logger: false });
const PORT = Number(process.env.PORT || 8787);
const distDir = resolve("dist");

await app.register(cors, { origin: true, credentials: true });
await app.register(fastifyJwt, { secret: process.env.JWT_SECRET });

// SSE clients
const sseClients = new Set();

function broadcast(event) {
  const msg = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach((reply) => { try { reply.raw.write(msg); } catch {} });
}

async function addEvent(type, message, actor = "系统") {
  const event = { id: `E-${Date.now()}-${Math.round(Math.random()*1000)}`, time: "刚刚", type, message, actor };
  await prisma.event.create({ data: event });
  broadcast(event);
  return event;
}

async function addAudit(actor, action, entity, before = null, after = null) {
  await prisma.auditLog.create({
    data: { id: `A-${Date.now()}-${Math.round(Math.random()*1000)}`, actor, action, entity, beforeJson: before, afterJson: after }
  });
}

function paginateParams(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

// Auth decorator
app.decorate("authenticate", async function (request, reply) {
  try { await request.jwtVerify(); } catch { reply.code(401).send({ error: "Unauthorized" }); }
});

// ─── Auth Routes ───
app.post("/api/auth/login", async (request, reply) => {
  const { userId, password } = request.body || {};
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return reply.code(404).send({ error: "用户不存在" });
  if (!compareSync(password || "", user.password)) return reply.code(401).send({ error: "密码错误" });
  await prisma.user.update({ where: { id: userId }, data: { status: "在线", lastActive: "刚刚" } });
  const token = app.jwt.sign({ userId: user.id, role: user.roleKey }, { expiresIn: "24h" });
  await addEvent("系统", `${user.name} 已登录 ${user.plant} 工作台`, user.name);
  await addAudit(user.name, "login", user.id, null, { id: user.id, name: user.name });
  return { token, user: formatUser(user) };
});

app.get("/api/auth/me", { preHandler: [app.authenticate] }, async (request) => {
  const user = await prisma.user.findUnique({ where: { id: request.user.userId } });
  return user ? formatUser(user) : {};
});

// ─── Snapshot ───
app.get("/api/snapshot", async (request) => {
  const userId = request.headers["x-user-id"] || request.query.userId || "U-1001";
  return buildSnapshot(userId);
});

// ─── SSE ───
app.get("/api/events/stream", async (request, reply) => {
  reply.raw.writeHead(200, { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache", connection: "keep-alive" });
  reply.raw.write(`data: ${JSON.stringify({ type: "系统", message: "实时事件通道已连接" })}\n\n`);
  sseClients.add(reply);
  request.raw.on("close", () => sseClients.delete(reply));
});

// ─── Orders ───
app.get("/api/orders", async (request) => {
  const { keyword, status, priority, line } = request.query;
  const { page, pageSize, skip } = paginateParams(request.query);
  const where = {};
  if (keyword) where.OR = [
    { id: { contains: keyword, mode: "insensitive" } },
    { customer: { contains: keyword, mode: "insensitive" } },
    { sku: { contains: keyword, mode: "insensitive" } },
  ];
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (line) where.line = line;

  const [data, total] = await Promise.all([
    prisma.workOrder.findMany({ where, orderBy: [{ priority: "asc" }, { id: "asc" }], skip, take: pageSize }),
    prisma.workOrder.count({ where }),
  ]);
  return { data, total, page, pageSize };
});

app.get("/api/orders/:id", async (request, reply) => {
  const { id } = request.params;
  const order = await prisma.workOrder.findUnique({ where: { id } });
  if (!order) return reply.code(404).send({ error: "工单不存在" });
  const auditLogs = await prisma.auditLog.findMany({ where: { entity: id }, orderBy: { createdAt: "desc" }, take: 20 });
  const qualityRelated = await prisma.qualityIssue.findMany({ where: { source: { contains: id } } });
  return { ...order, auditLogs, qualityIssues: qualityRelated };
});

app.post("/api/orders", async (request, reply) => {
  const body = request.body || {};
  if (!body.customer || !body.sku || !body.line) return reply.code(400).send({ error: "缺少必填字段" });
  const id = body.id || `WO-${Date.now().toString().slice(-6)}`;
  const created = await prisma.workOrder.create({
    data: {
      id,
      customer: body.customer,
      sku: body.sku,
      line: body.line,
      due: body.due || "",
      priority: body.priority || "P2",
      status: body.status || "正常",
      progress: Number(body.progress) || 0,
      blockers: Array.isArray(body.blockers) ? body.blockers : [],
    },
  });
  await addEvent("计划", `新建工单 ${id}（${body.customer}）`, body.actor || "计划员");
  await addAudit(body.actor || "计划员", "create_order", id, null, created);
  return created;
});

app.put("/api/orders/:id", async (request, reply) => {
  const { id } = request.params;
  const body = request.body || {};
  const order = await prisma.workOrder.findUnique({ where: { id } });
  if (!order) return reply.code(404).send({ error: "工单不存在" });
  const updated = await prisma.workOrder.update({
    where: { id },
    data: {
      customer: body.customer ?? order.customer,
      sku: body.sku ?? order.sku,
      line: body.line ?? order.line,
      due: body.due ?? order.due,
      priority: body.priority ?? order.priority,
      status: body.status ?? order.status,
      progress: body.progress != null ? Number(body.progress) : order.progress,
      blockers: Array.isArray(body.blockers) ? body.blockers : order.blockers,
    },
  });
  await addEvent("计划", `工单 ${id} 已更新`, body.actor || "计划员");
  await addAudit(body.actor || "计划员", "update_order", id, order, updated);
  return updated;
});

app.delete("/api/orders/:id", async (request, reply) => {
  const { id } = request.params;
  const order = await prisma.workOrder.findUnique({ where: { id } });
  if (!order) return reply.code(404).send({ error: "工单不存在" });
  await prisma.workOrder.delete({ where: { id } });
  await addEvent("计划", `工单 ${id} 已关闭`, "计划员");
  await addAudit("计划员", "delete_order", id, order, null);
  return { ok: true };
});

app.post("/api/orders/:id/advance", async (request) => {
  const { id } = request.params;
  const order = await prisma.workOrder.findUnique({ where: { id } });
  if (!order) return { error: "Order not found" };
  const nextProgress = Math.min(order.progress + 16, 100);
  const nextStatus = nextProgress === 100 ? "完成" : order.blockers.length ? order.status : "正常";
  const updated = await prisma.workOrder.update({ where: { id }, data: { progress: nextProgress, status: nextStatus } });
  await addEvent("生产", `${id} 已完成一次工序报工，进度 ${nextProgress}%`, "陈班长");
  await addAudit("陈班长", "advance_order", id, order, updated);
  return updated;
});

// ─── Materials ───
app.get("/api/materials", async (request) => {
  const { keyword, lowStockOnly } = request.query;
  const { page, pageSize, skip } = paginateParams(request.query);
  const where = {};
  if (keyword) where.OR = [
    { id: { contains: keyword, mode: "insensitive" } },
    { name: { contains: keyword, mode: "insensitive" } },
    { location: { contains: keyword, mode: "insensitive" } },
  ];
  let data = await prisma.material.findMany({ where, orderBy: { id: "asc" } });
  if (lowStockOnly === "1" || lowStockOnly === "true") {
    data = data.filter((m) => m.stock < m.safeStock);
  }
  const total = data.length;
  data = data.slice(skip, skip + pageSize);
  return { data, total, page, pageSize };
});

app.post("/api/materials", async (request, reply) => {
  const body = request.body || {};
  if (!body.name) return reply.code(400).send({ error: "缺少物料名称" });
  const id = body.id || `M-${Date.now().toString().slice(-3)}`;
  const created = await prisma.material.create({
    data: {
      id, name: body.name,
      stock: Number(body.stock) || 0,
      safeStock: Number(body.safeStock) || 0,
      location: body.location || "",
      linkedOrders: Array.isArray(body.linkedOrders) ? body.linkedOrders : [],
    },
  });
  await addEvent("库存", `新增物料 ${id}（${body.name}）`, body.actor || "何仓储");
  await addAudit(body.actor || "何仓储", "create_material", id, null, created);
  return created;
});

app.put("/api/materials/:id", async (request, reply) => {
  const { id } = request.params;
  const body = request.body || {};
  const mat = await prisma.material.findUnique({ where: { id } });
  if (!mat) return reply.code(404).send({ error: "物料不存在" });
  const updated = await prisma.material.update({
    where: { id },
    data: {
      name: body.name ?? mat.name,
      stock: body.stock != null ? Number(body.stock) : mat.stock,
      safeStock: body.safeStock != null ? Number(body.safeStock) : mat.safeStock,
      location: body.location ?? mat.location,
      linkedOrders: Array.isArray(body.linkedOrders) ? body.linkedOrders : mat.linkedOrders,
    },
  });
  await addEvent("库存", `物料 ${id} 已更新`, body.actor || "何仓储");
  await addAudit(body.actor || "何仓储", "update_material", id, mat, updated);
  return updated;
});

app.delete("/api/materials/:id", async (request, reply) => {
  const { id } = request.params;
  const mat = await prisma.material.findUnique({ where: { id } });
  if (!mat) return reply.code(404).send({ error: "物料不存在" });
  await prisma.material.delete({ where: { id } });
  await addEvent("库存", `物料 ${id} 已下架`, "何仓储");
  await addAudit("何仓储", "delete_material", id, mat, null);
  return { ok: true };
});

app.post("/api/materials/:id/replenish", async (request) => {
  const { id } = request.params;
  const mat = await prisma.material.findUnique({ where: { id } });
  if (!mat) return { error: "Material not found" };
  const updated = await prisma.material.update({ where: { id }, data: { stock: mat.safeStock + 260 } });
  await addEvent("库存", `${id} 已模拟补货入库`, "何仓储");
  await addAudit("何仓储", "replenish_material", id, mat, updated);
  return updated;
});

// 出入库
app.post("/api/materials/:id/move", async (request, reply) => {
  const { id } = request.params;
  const { delta, reason } = request.body || {};
  const mat = await prisma.material.findUnique({ where: { id } });
  if (!mat) return reply.code(404).send({ error: "物料不存在" });
  const newStock = Math.max(0, mat.stock + Number(delta || 0));
  const updated = await prisma.material.update({ where: { id }, data: { stock: newStock } });
  await addEvent("库存", `${id} ${Number(delta) > 0 ? "入库" : "出库"} ${Math.abs(Number(delta))} 件 · ${reason || ""}`, "何仓储");
  await addAudit("何仓储", "move_material", id, mat, updated);
  return updated;
});

// ─── Quality ───
app.get("/api/quality", async (request) => {
  const { keyword, severity, status } = request.query;
  const { page, pageSize, skip } = paginateParams(request.query);
  const where = {};
  if (keyword) where.OR = [
    { id: { contains: keyword, mode: "insensitive" } },
    { batch: { contains: keyword, mode: "insensitive" } },
    { source: { contains: keyword, mode: "insensitive" } },
    { rootCause: { contains: keyword, mode: "insensitive" } },
  ];
  if (severity) where.severity = severity;
  if (status) where.status = status;
  const [data, total] = await Promise.all([
    prisma.qualityIssue.findMany({ where, orderBy: { id: "asc" }, skip, take: pageSize }),
    prisma.qualityIssue.count({ where }),
  ]);
  return { data, total, page, pageSize };
});

app.post("/api/quality", async (request, reply) => {
  const body = request.body || {};
  if (!body.batch) return reply.code(400).send({ error: "缺少批次号" });
  const id = body.id || `Q-${Date.now().toString().slice(-6)}`;
  const created = await prisma.qualityIssue.create({
    data: {
      id, batch: body.batch,
      severity: body.severity || "中",
      source: body.source || "",
      owner: body.owner || "",
      status: body.status || "待处理",
      rootCause: body.rootCause || "",
    },
  });
  await addEvent("质量", `新增质量偏差 ${id}（${body.batch}）`, body.actor || "吴质检");
  await addAudit(body.actor || "吴质检", "create_quality_issue", id, null, created);
  return created;
});

app.put("/api/quality/:id", async (request, reply) => {
  const { id } = request.params;
  const body = request.body || {};
  const issue = await prisma.qualityIssue.findUnique({ where: { id } });
  if (!issue) return reply.code(404).send({ error: "偏差不存在" });
  const updated = await prisma.qualityIssue.update({
    where: { id },
    data: {
      batch: body.batch ?? issue.batch,
      severity: body.severity ?? issue.severity,
      source: body.source ?? issue.source,
      owner: body.owner ?? issue.owner,
      status: body.status ?? issue.status,
      rootCause: body.rootCause ?? issue.rootCause,
    },
  });
  await addAudit(body.actor || "吴质检", "update_quality_issue", id, issue, updated);
  return updated;
});

app.delete("/api/quality/:id", async (request, reply) => {
  const { id } = request.params;
  const issue = await prisma.qualityIssue.findUnique({ where: { id } });
  if (!issue) return reply.code(404).send({ error: "偏差不存在" });
  await prisma.qualityIssue.delete({ where: { id } });
  await addAudit("吴质检", "delete_quality_issue", id, issue, null);
  return { ok: true };
});

app.post("/api/quality/:id/close", async (request) => {
  const { id } = request.params;
  const issue = await prisma.qualityIssue.findUnique({ where: { id } });
  if (!issue) return { error: "Quality issue not found" };
  const updated = await prisma.qualityIssue.update({ where: { id }, data: { status: "已关闭" } });
  await addEvent("质量", `${id} 偏差已关闭，批次追溯链已归档`, "吴质检");
  await addAudit("吴质检", "close_quality_issue", id, issue, updated);
  return updated;
});

// ─── Equipment ───
app.get("/api/equipment", async (request) => {
  const { keyword, status, line } = request.query;
  const { page, pageSize, skip } = paginateParams(request.query);
  const where = {};
  if (keyword) where.OR = [
    { id: { contains: keyword, mode: "insensitive" } },
    { name: { contains: keyword, mode: "insensitive" } },
    { plant: { contains: keyword, mode: "insensitive" } },
  ];
  if (status) where.status = status;
  if (line) where.line = line;
  const [data, total] = await Promise.all([
    prisma.equipmentAsset.findMany({ where, orderBy: { id: "asc" }, skip, take: pageSize }),
    prisma.equipmentAsset.count({ where }),
  ]);
  return { data, total, page, pageSize };
});

app.post("/api/equipment", async (request, reply) => {
  const body = request.body || {};
  if (!body.name) return reply.code(400).send({ error: "缺少设备名称" });
  const id = body.id || `EQ-${Date.now().toString().slice(-3)}`;
  const created = await prisma.equipmentAsset.create({
    data: {
      id, name: body.name,
      line: body.line || "",
      plant: body.plant || "",
      status: body.status || "运行",
      health: Number(body.health) || 100,
      oee: Number(body.oee) || 0,
      temperature: Number(body.temperature) || 25,
      vibration: Number(body.vibration) || 0,
      nextMaintenance: body.nextMaintenance || "",
      owner: body.owner || "",
      sensors: Array.isArray(body.sensors) ? body.sensors : [],
    },
  });
  await addEvent("生产", `新增设备 ${id}（${body.name}）`, body.actor || "设备工程");
  await addAudit(body.actor || "设备工程", "create_equipment", id, null, created);
  return created;
});

app.put("/api/equipment/:id", async (request, reply) => {
  const { id } = request.params;
  const body = request.body || {};
  const asset = await prisma.equipmentAsset.findUnique({ where: { id } });
  if (!asset) return reply.code(404).send({ error: "设备不存在" });
  const updated = await prisma.equipmentAsset.update({
    where: { id },
    data: {
      name: body.name ?? asset.name,
      line: body.line ?? asset.line,
      plant: body.plant ?? asset.plant,
      status: body.status ?? asset.status,
      health: body.health != null ? Number(body.health) : asset.health,
      oee: body.oee != null ? Number(body.oee) : asset.oee,
      temperature: body.temperature != null ? Number(body.temperature) : asset.temperature,
      vibration: body.vibration != null ? Number(body.vibration) : asset.vibration,
      nextMaintenance: body.nextMaintenance ?? asset.nextMaintenance,
      owner: body.owner ?? asset.owner,
      sensors: Array.isArray(body.sensors) ? body.sensors : asset.sensors,
    },
  });
  await addAudit(body.actor || "设备工程", "update_equipment", id, asset, updated);
  return updated;
});

app.delete("/api/equipment/:id", async (request, reply) => {
  const { id } = request.params;
  const asset = await prisma.equipmentAsset.findUnique({ where: { id } });
  if (!asset) return reply.code(404).send({ error: "设备不存在" });
  await prisma.equipmentAsset.delete({ where: { id } });
  await addAudit("设备工程", "delete_equipment", id, asset, null);
  return { ok: true };
});

app.post("/api/equipment/:id/check", async (request) => {
  const { id } = request.params;
  const asset = await prisma.equipmentAsset.findUnique({ where: { id } });
  if (!asset) return { error: "Equipment not found" };
  const updated = await prisma.equipmentAsset.update({ where: { id }, data: {
    status: "运行", health: Math.min(asset.health + 8, 100), temperature: Math.max(asset.temperature - 3, 35), vibration: Math.max(asset.vibration - 0.5, 0.8), nextMaintenance: "7 天后"
  }});
  await addEvent("生产", `${asset.name} 已完成点检保养`, "设备工程");
  await addAudit("设备工程", "equipment_check", id, asset, updated);
  return updated;
});

// ─── Process Routes ───
app.get("/api/routes", async () => prisma.processRoute.findMany({ orderBy: { id: "asc" } }));

app.post("/api/routes/:id/publish", async (request) => {
  const { id } = request.params;
  const route = await prisma.processRoute.findUnique({ where: { id } });
  if (!route) return { error: "Route not found" };
  const steps = (route.steps || []).map((s) => ({ ...s, status: "已发布" }));
  const updated = await prisma.processRoute.update({ where: { id }, data: { status: "已发布", steps } });
  await addEvent("系统", `${route.product} ${route.version} 工艺路线已发布`, "工艺工程");
  await addAudit("工艺工程", "publish_route", id, route, updated);
  return updated;
});

// ─── Kanban ───
app.get("/api/kanban", async () => prisma.kanbanBoard.findMany({ orderBy: { id: "asc" } }));

app.post("/api/kanban/:id/publish", async (request) => {
  const { id } = request.params;
  const board = await prisma.kanbanBoard.findUnique({ where: { id } });
  if (!board) return { error: "Kanban not found" };
  const updated = await prisma.kanbanBoard.update({ where: { id }, data: { status: "已发布", lastPublished: "刚刚" } });
  await addEvent("系统", `${board.name} 已发布到 ${board.audience}`, board.owner);
  return updated;
});

// ─── Recommendations ───
app.post("/api/recommendations/:id/execute", async (request) => {
  const { id } = request.params;
  const rec = await prisma.recommendation.findUnique({ where: { id } });
  if (!rec) return { error: "Recommendation not found" };
  await prisma.recommendation.update({ where: { id }, data: { accepted: true } });
  if (id === "R-1") {
    await prisma.workOrder.update({ where: { id: "WO-61872" }, data: { line: "L3", status: "正常", progress: { increment: 9 }, blockers: [] } }).catch(() => {});
    await addEvent("计划", "AI 重排已执行：WO-61872 切换至 L3", "林计划");
  } else if (id === "R-2") {
    await prisma.material.update({ where: { id: "M-884" }, data: { stock: { increment: 520 } } }).catch(() => {});
    await addEvent("库存", "M-884 已创建补货任务，预计 14:30 前补齐", "何仓储");
  } else {
    await addEvent("系统", "AI 建议已执行", "工艺工程");
  }
  await addAudit("林计划", "execute_recommendation", id, rec, { ...rec, accepted: true });
  return { ok: true };
});

// ─── Intelligence ───
app.post("/api/insights/:id/resolve", async (request) => {
  const { id } = request.params;
  const insight = await prisma.intelligenceInsight.findUnique({ where: { id } });
  if (!insight) return { error: "Insight not found" };
  await prisma.intelligenceInsight.update({ where: { id }, data: { status: "已处理" } });
  await addEvent("系统", `数据智能洞察 ${insight.title} 已处理`, "系统");
  await addAudit("系统", "resolve_insight", id, insight, { ...insight, status: "已处理" });
  return { ok: true };
});

// ─── Commercial ───
app.post("/api/commercial/:id/plan", async (request) => {
  const { id } = request.params;
  const pkg = await prisma.commercialPackage.findUnique({ where: { id } });
  if (!pkg) return { error: "Package not found" };
  await prisma.salesOpportunity.create({
    data: { id: `OP-${Date.now()}`, packageId: id, customer: "华东制造集团", owner: "售前顾问", stage: "售前方案", nextStep: `围绕 ${pkg.name} 输出 ROI 和实施路径`, status: "进行中" }
  });
  await addEvent("系统", `${pkg.name} 售前方案已生成`, "售前顾问");
  return { ok: true };
});

app.post("/api/opportunities/:id/convert", async (request) => {
  const { id } = request.params;
  const opp = await prisma.salesOpportunity.findUnique({ where: { id } });
  if (!opp) return { error: "Opportunity not found" };
  await prisma.salesOpportunity.update({ where: { id }, data: { status: "已转实施", stage: "实施蓝图" } });
  await addEvent("系统", `${opp.customer} 已从售前转入实施`, "售前顾问");
  return { ok: true };
});

// ─── Implementation ───
app.post("/api/implementation/:id/advance", async (request) => {
  const { id } = request.params;
  const phase = await prisma.implementationPhase.findUnique({ where: { id } });
  if (!phase) return { error: "Phase not found" };
  const nextStatus = phase.status === "待开始" ? "进行中" : "已完成";
  await prisma.implementationPhase.update({ where: { id }, data: { status: nextStatus } });
  await addEvent("系统", `${phase.name} 已推进为${nextStatus}`, "实施顾问");
  return { ok: true };
});

// ─── Activation Tasks ───
app.post("/api/activation/:id/complete", async (request) => {
  const { id } = request.params;
  const task = await prisma.activationTask.findUnique({ where: { id } });
  if (!task) return { error: "Task not found" };
  await prisma.activationTask.update({ where: { id }, data: { status: "已完成" } });
  await addEvent("系统", `${task.role} 启用任务已完成`, "客户成功");
  return { ok: true };
});

// ─── Master Data ───
app.post("/api/master-data/:id/verify", async (request) => {
  const { id } = request.params;
  const check = await prisma.masterDataCheck.findUnique({ where: { id } });
  if (!check) return { error: "Check not found" };
  await prisma.masterDataCheck.update({ where: { id }, data: { status: "已校验", readiness: 100, issues: 0 } });
  await addEvent("系统", `${check.domain} 已完成导入校验`, "IT");
  return { ok: true };
});

// ─── Rules ───
app.post("/api/rules/:id/toggle", async (request) => {
  const { id } = request.params;
  const rule = await prisma.rule.findUnique({ where: { id } });
  if (!rule) return { error: "Rule not found" };
  await prisma.rule.update({ where: { id }, data: { enabled: !rule.enabled } });
  await addEvent("系统", `${rule.name} 已${rule.enabled ? "停用" : "启用"}`, "系统");
  return { ok: true };
});

// ─── Integrations ───
app.post("/api/integrations/:id/sync", async (request) => {
  const { id } = request.params;
  const integ = await prisma.integration.findUnique({ where: { id } });
  if (!integ) return { error: "Integration not found" };
  await prisma.integration.update({ where: { id }, data: { status: "已连接", lastSync: "刚刚" } });
  await addEvent("系统", `${integ.name} 已完成同步`, "系统");
  return { ok: true };
});

// ─── Mobile Tasks ───
app.post("/api/mobile/:id/complete", async (request) => {
  const { id } = request.params;
  const task = await prisma.mobileTask.findUnique({ where: { id } });
  if (!task) return { error: "Task not found" };
  await prisma.mobileTask.update({ where: { id }, data: { status: "已完成" } });
  await addEvent(task.type === "报工" ? "生产" : task.type === "发料" ? "库存" : "质量", `${task.title} 已通过移动端完成`, task.owner);
  return { ok: true };
});

// ─── Workflows ───
app.post("/api/workflows/:id/advance", async (request) => {
  const { id } = request.params;
  const wf = await prisma.workflowInstance.findUnique({ where: { id } });
  if (!wf) return { error: "Workflow not found" };
  const nextStep = Math.min(wf.currentStep + 1, wf.steps.length - 1);
  const nextStatus = nextStep >= wf.steps.length - 1 ? "已完成" : "进行中";
  await prisma.workflowInstance.update({ where: { id }, data: { currentStep: nextStep, status: nextStatus } });
  await addEvent("系统", `${wf.name} 已推进到 ${wf.steps[nextStep]}`, wf.owner);
  return { ok: true };
});

// ─── Templates ───
app.post("/api/templates/:id/apply", async (request) => {
  const { id } = request.params;
  const tpl = await prisma.industryTemplate.findUnique({ where: { id } });
  if (!tpl) return { error: "Template not found" };
  await prisma.industryTemplate.updateMany({ data: { status: "可启用" } });
  await prisma.industryTemplate.update({ where: { id }, data: { status: "已启用" } });
  await addEvent("系统", `${tpl.name} 已启用`, "实施顾问");
  return { ok: true };
});

// ─── Admin ───
app.post("/api/admin/reset", async () => {
  await prisma.$executeRawUnsafe("TRUNCATE TABLE events, audit_logs, recommendations, intelligence_insights CASCADE");
  await addEvent("系统", "演示环境已重置", "系统");
  return { ok: true };
});

app.get("/api/health", async () => ({ ok: true, service: "blacklake-saas", version: "2.1.0" }));

// ─── Events list ───
app.get("/api/events", async (request) => {
  const { keyword, type } = request.query;
  const { page, pageSize, skip } = paginateParams(request.query);
  const where = {};
  if (keyword) where.message = { contains: keyword, mode: "insensitive" };
  if (type) where.type = type;
  const [data, total] = await Promise.all([
    prisma.event.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
    prisma.event.count({ where }),
  ]);
  return { data, total, page, pageSize };
});

// ─── Audit logs ───
app.get("/api/audit", async (request) => {
  const { keyword, action, actor, from, to } = request.query;
  const { page, pageSize, skip } = paginateParams(request.query);
  const where = {};
  if (keyword) where.OR = [
    { entity: { contains: keyword, mode: "insensitive" } },
    { actor: { contains: keyword, mode: "insensitive" } },
  ];
  if (action) where.action = action;
  if (actor) where.actor = actor;
  if (from || to) where.createdAt = {};
  if (from) where.createdAt.gte = new Date(from);
  if (to) where.createdAt.lte = new Date(to);
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
    prisma.auditLog.count({ where }),
  ]);
  return { data, total, page, pageSize };
});

// ─── Lines ───
app.get("/api/lines", async () => prisma.line.findMany({ orderBy: { id: "asc" } }));

// ─── Users ───
app.get("/api/users", async (request) => {
  const { keyword, role, status } = request.query || {};
  const where = {};
  if (keyword) where.OR = [
    { id: { contains: keyword, mode: "insensitive" } },
    { name: { contains: keyword, mode: "insensitive" } },
    { email: { contains: keyword, mode: "insensitive" } },
  ];
  if (role) where.role = role;
  if (status) where.status = status;
  const users = await prisma.user.findMany({ where, orderBy: { id: "asc" } });
  return users.map(formatUser);
});

app.post("/api/users", async (request, reply) => {
  const body = request.body || {};
  if (!body.name || !body.role) return reply.code(400).send({ error: "缺少姓名或角色" });
  const id = body.id || `U-${Date.now().toString().slice(-4)}`;
  const created = await prisma.user.create({
    data: {
      id, name: body.name,
      email: body.email || "",
      password: body.password || "$2a$10$0000000000000000000000",
      role: body.role,
      roleKey: body.roleKey || "planner",
      department: body.department || "",
      title: body.title || "",
      plant: body.plant || "",
      status: body.status || "离线",
      lastActive: body.lastActive || "刚刚",
      permissions: Array.isArray(body.permissions) ? body.permissions : [],
    },
  });
  await addEvent("系统", `新增用户 ${created.name}（${created.role}）`, "系统管理员");
  await addAudit("系统管理员", "create_user", id, null, formatUser(created));
  return formatUser(created);
});

app.put("/api/users/:id", async (request, reply) => {
  const { id } = request.params;
  const body = request.body || {};
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return reply.code(404).send({ error: "用户不存在" });
  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: body.name ?? u.name,
      email: body.email ?? u.email,
      role: body.role ?? u.role,
      roleKey: body.roleKey ?? u.roleKey,
      department: body.department ?? u.department,
      title: body.title ?? u.title,
      plant: body.plant ?? u.plant,
      status: body.status ?? u.status,
      permissions: Array.isArray(body.permissions) ? body.permissions : u.permissions,
    },
  });
  await addAudit("系统管理员", "update_user", id, formatUser(u), formatUser(updated));
  return formatUser(updated);
});

app.delete("/api/users/:id", async (request, reply) => {
  const { id } = request.params;
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return reply.code(404).send({ error: "用户不存在" });
  await prisma.user.update({ where: { id }, data: { status: "已停用" } });
  await addEvent("系统", `用户 ${u.name} 已停用`, "系统管理员");
  await addAudit("系统管理员", "disable_user", id, formatUser(u), null);
  return { ok: true };
});

// ─── Commercial data ───
app.get("/api/commercial/packages", async () => prisma.commercialPackage.findMany({ orderBy: { id: "asc" } }));
app.get("/api/commercial/opportunities", async () => prisma.salesOpportunity.findMany({ orderBy: { createdAt: "desc" } }));

// ─── Implementation ───
app.get("/api/implementation", async () => prisma.implementationPhase.findMany({ orderBy: { sortOrder: "asc" } }));
app.get("/api/activation", async () => prisma.activationTask.findMany({ orderBy: { id: "asc" } }));
app.get("/api/master-data", async () => prisma.masterDataCheck.findMany({ orderBy: { id: "asc" } }));

// ─── Intelligence ───
app.get("/api/insights", async () => prisma.intelligenceInsight.findMany({ orderBy: { id: "asc" } }));
app.get("/api/recommendations", async () => prisma.recommendation.findMany({ orderBy: { id: "asc" } }));

// ─── Platform ───
app.get("/api/rules", async () => prisma.rule.findMany({ orderBy: { id: "asc" } }));
app.get("/api/integrations", async () => prisma.integration.findMany({ orderBy: { id: "asc" } }));
app.get("/api/workflows", async () => prisma.workflowInstance.findMany({ orderBy: { id: "asc" } }));
app.get("/api/templates", async () => prisma.industryTemplate.findMany({ orderBy: { id: "asc" } }));

// ─── Global Search ───
app.get("/api/search", async (request) => {
  const q = (request.query.q || "").trim();
  if (!q) return { orders: [], materials: [], quality: [], equipment: [] };
  const ilike = { contains: q, mode: "insensitive" };
  const [orders, materials, quality, equipment] = await Promise.all([
    prisma.workOrder.findMany({ where: { OR: [{ id: ilike }, { customer: ilike }, { sku: ilike }] }, take: 8 }),
    prisma.material.findMany({ where: { OR: [{ id: ilike }, { name: ilike }] }, take: 8 }),
    prisma.qualityIssue.findMany({ where: { OR: [{ id: ilike }, { batch: ilike }, { source: ilike }] }, take: 8 }),
    prisma.equipmentAsset.findMany({ where: { OR: [{ id: ilike }, { name: ilike }] }, take: 8 }),
  ]);
  return { orders, materials, quality, equipment };
});

// ─── Static ───
if (existsSync(distDir)) {
  await app.register(fastifyStatic, { root: distDir, prefix: "/" });
  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith("/api/")) return reply.code(404).send({ error: "API route not found" });
    return reply.sendFile("index.html");
  });
}

function formatUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, roleKey: u.roleKey, department: u.department, title: u.title, plant: u.plant, status: u.status, lastActive: u.lastActive, permissions: u.permissions };
}

async function buildSnapshot(userId) {
  const [tenant, currentUser, users, orders, materials, qualityIssues, lines, equipment, routes, kanbans, events, recommendations, insights, rules, integrations, phases, activation, masterData, mobileTasks, templates, workflows, auditLogs, packages, opportunities] = await Promise.all([
    prisma.tenant.findFirst(),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findMany({ orderBy: { id: "asc" } }),
    prisma.workOrder.findMany({ orderBy: [{ priority: "asc" }, { id: "asc" }] }),
    prisma.material.findMany({ orderBy: { id: "asc" } }),
    prisma.qualityIssue.findMany({ orderBy: { id: "asc" } }),
    prisma.line.findMany({ orderBy: { id: "asc" } }),
    prisma.equipmentAsset.findMany({ orderBy: { id: "asc" } }),
    prisma.processRoute.findMany({ orderBy: { id: "asc" } }),
    prisma.kanbanBoard.findMany({ orderBy: { id: "asc" } }),
    prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.recommendation.findMany({ orderBy: { id: "asc" } }),
    prisma.intelligenceInsight.findMany({ orderBy: { id: "asc" } }),
    prisma.rule.findMany({ orderBy: { id: "asc" } }),
    prisma.integration.findMany({ orderBy: { id: "asc" } }),
    prisma.implementationPhase.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.activationTask.findMany({ orderBy: { id: "asc" } }),
    prisma.masterDataCheck.findMany({ orderBy: { id: "asc" } }),
    prisma.mobileTask.findMany({ orderBy: { id: "asc" } }),
    prisma.industryTemplate.findMany({ orderBy: { id: "asc" } }),
    prisma.workflowInstance.findMany({ orderBy: { id: "asc" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.commercialPackage.findMany({ orderBy: { id: "asc" } }),
    prisma.salesOpportunity.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return {
    tenant, currentUser: currentUser ? formatUser(currentUser) : null,
    users: users.map(formatUser), orders, materials, qualityIssues, lines,
    equipmentAssets: equipment, processRoutes: routes, kanbanBoards: kanbans,
    events, recommendations, intelligenceInsights: insights, rules, integrations,
    implementationPhases: phases, activationTasks: activation, masterDataChecks: masterData,
    mobileTasks, industryTemplates: templates, workflowInstances: workflows,
    auditLogs, commercialPackages: packages, salesOpportunities: opportunities,
  };
}

// Start
try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`BlackLake SaaS server listening on http://0.0.0.0:${PORT}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
