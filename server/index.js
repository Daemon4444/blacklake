import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { addEvent, audit, createDatabaseBackup, databaseAdminStatus, db, getUser, json, migrate, parse, snapshot, touchUser } from "./db.js";

const port = Number(process.env.PORT || 8787);
const distDir = resolve("dist");
const clients = new Set();

migrate();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolveBody(body ? JSON.parse(body) : {}));
    req.on("error", reject);
  });
}

function broadcast(event) {
  const message = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach((res) => res.write(message));
}

function respondWithSnapshot(req, res, event) {
  if (event) broadcast(event);
  sendJson(res, 200, snapshot(currentUserId(req)));
}

function currentUserId(req, body = {}) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  return body.userId || req.headers["x-user-id"] || url.searchParams.get("userId") || "U-1001";
}

function currentActor(req) {
  return getUser(currentUserId(req))?.name || "林计划";
}

function addEventFor(req, type, message) {
  return addEvent(type, message, currentActor(req));
}

async function handleApi(req, res, path, body = {}) {
  if (req.method === "GET" && path === "/api/health") {
    return sendJson(res, 200, { ok: true, service: "zhuyun-saas", version: "1.0.0" });
  }

  if (req.method === "POST" && path === "/api/auth/login") {
    const user = getUser(body.userId);
    if (!user) return sendJson(res, 404, { error: "Employee not found" });
    if (body.password !== "demo123") return sendJson(res, 401, { error: "Invalid employee password" });
    touchUser(user.id);
    const event = addEvent("系统", `${user.name} 已登录 ${user.plant} 工作台，角色权限与协同事件流已同步`, user.name);
    audit(user.name, "login_employee", user.id, null, user);
    return sendJson(res, 200, snapshot(user.id));
  }

  if (req.method === "GET" && path === "/api/admin/database") {
    return sendJson(res, 200, databaseAdminStatus());
  }

  if (req.method === "GET" && path === "/api/snapshot") {
    const userId = currentUserId(req);
    touchUser(userId);
    return sendJson(res, 200, snapshot(userId));
  }

  if (req.method === "GET" && path === "/api/events/stream") {
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });
    res.write(`data: ${JSON.stringify({ type: "系统", message: "实时事件通道已连接" })}\n\n`);
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.method === "POST" && path.match(/^\/api\/recommendations\/[^/]+\/execute$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM recommendations WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Recommendation not found" });

    db.prepare("UPDATE recommendations SET accepted = 1 WHERE id = ?").run(id);
    let event;

    if (id === "R-1") {
      const order = db.prepare("SELECT * FROM work_orders WHERE id = 'WO-61872'").get();
      db.prepare("UPDATE work_orders SET line = 'L3', status = '正常', progress = min(progress + 9, 100), blockers = '[]' WHERE id = 'WO-61872'").run();
      event = addEventFor(req, "计划", "AI 重排已执行：WO-61872 切换至 L3，相关首件确认任务已生成");
      audit(currentActor(req), "execute_recommendation", "WO-61872", order, db.prepare("SELECT * FROM work_orders WHERE id = 'WO-61872'").get());
    } else if (id === "R-2") {
      const material = db.prepare("SELECT * FROM materials WHERE id = 'M-884'").get();
      db.prepare("UPDATE materials SET stock = stock + 520 WHERE id = 'M-884'").run();
      event = addEventFor(req, "库存", "M-884 已创建补货任务，预计 14:30 前补齐安全库存");
      audit(currentActor(req), "execute_recommendation", "M-884", material, db.prepare("SELECT * FROM materials WHERE id = 'M-884'").get());
    } else {
      event = addEventFor(req, "系统", "WO-61928 已挂载华南二厂压装 SOP 模板，等待工程确认");
      audit(currentActor(req), "execute_recommendation", id, before, { ...before, accepted: 1 });
    }

    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/commercial\/[^/]+\/plan$/)) {
    const id = path.split("/")[3];
    const selectedPackage = db.prepare("SELECT * FROM commercial_packages WHERE id = ?").get(id);
    if (!selectedPackage) return sendJson(res, 404, { error: "Commercial package not found" });

    const existing = db.prepare("SELECT * FROM sales_opportunities WHERE package_id = ? ORDER BY id DESC LIMIT 1").get(id);
    if (!existing) {
      db.prepare("INSERT INTO sales_opportunities VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        `OP-${Date.now()}`,
        id,
        "华东制造集团",
        currentActor(req),
        "售前方案",
        `围绕 ${selectedPackage.name} 输出 ROI、模块范围、试点产线和报价口径。`,
        "进行中",
      );
    }

    const event = addEventFor(req, "系统", `${selectedPackage.name} 售前方案已生成：套餐、ROI、实施路径与模块范围已进入商机池`);
    audit(currentActor(req), "create_commercial_plan", id, selectedPackage, existing || db.prepare("SELECT * FROM sales_opportunities WHERE package_id = ? ORDER BY id DESC LIMIT 1").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/opportunities\/[^/]+\/convert$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM sales_opportunities WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Sales opportunity not found" });

    db.prepare("UPDATE sales_opportunities SET status = '已转实施', stage = '实施蓝图', next_step = '已生成客户启动中心：角色启用、主数据准备度和上线蓝图进入协同推进。' WHERE id = ?").run(id);
    db.prepare("UPDATE implementation_phases SET status = '已完成' WHERE id = 'IMP-0'").run();
    db.prepare("UPDATE implementation_phases SET status = '进行中' WHERE id = 'IMP-1' AND status <> '已完成'").run();

    const event = addEventFor(req, "系统", `${before.customer} 已从售前商机转入实施：客户启动中心、角色启用任务与主数据校验已就绪`);
    audit(currentActor(req), "convert_opportunity_to_implementation", id, before, db.prepare("SELECT * FROM sales_opportunities WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/activation\/[^/]+\/complete$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM activation_tasks WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Activation task not found" });

    const nextStatus = before.status === "已完成" ? "已完成" : "已完成";
    db.prepare("UPDATE activation_tasks SET status = ? WHERE id = ?").run(nextStatus, id);
    const event = addEventFor(req, "系统", `${before.role} 启用任务已完成：${before.workspace} 的首个业务动作已进入上线验收`);
    audit(currentActor(req), "complete_activation_task", id, before, db.prepare("SELECT * FROM activation_tasks WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/master-data\/[^/]+\/verify$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM master_data_checks WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Master data check not found" });

    db.prepare("UPDATE master_data_checks SET status = '已校验', readiness = 100, issues = 0 WHERE id = ?").run(id);
    const event = addEventFor(req, "系统", `${before.domain} 已完成导入校验：字段、来源和异常项已归档到实施蓝图`);
    audit(currentActor(req), "verify_master_data", id, before, db.prepare("SELECT * FROM master_data_checks WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/orders\/[^/]+\/advance$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM work_orders WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Order not found" });
    const nextProgress = Math.min(before.progress + 16, 100);
    const blockers = parse(before.blockers, []);
    const nextStatus = nextProgress === 100 ? "完成" : blockers.length ? before.status : "正常";
    db.prepare("UPDATE work_orders SET progress = ?, status = ? WHERE id = ?").run(nextProgress, nextStatus, id);
    const event = addEventFor(req, "生产", `${id} 已完成一次工序报工，进度同步到排程与管理看板`);
    audit(currentActor(req), "advance_order", id, before, db.prepare("SELECT * FROM work_orders WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/quality\/[^/]+\/close$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM quality_issues WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Quality issue not found" });
    db.prepare("UPDATE quality_issues SET status = '已关闭' WHERE id = ?").run(id);
    const event = addEventFor(req, "质量", `${id} 已完成偏差关闭，批次追溯链已归档`);
    audit(currentActor(req), "close_quality_issue", id, before, db.prepare("SELECT * FROM quality_issues WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/quality\/[^/]+\/inspect$/)) {
    const id = path.split("/")[3];
    const issue = db.prepare("SELECT * FROM quality_issues WHERE id = ?").get(id);
    if (!issue) return sendJson(res, 404, { error: "Quality issue not found" });
    const event = addEventFor(req, "质量", `${id} 追溯链已打开：批次、工序、责任人与处理记录已加载`);
    audit(currentActor(req), "inspect_quality_trace", id, issue, issue);
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/materials\/[^/]+\/replenish$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM materials WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Material not found" });
    db.prepare("UPDATE materials SET stock = safe_stock + 260 WHERE id = ?").run(id);
    const event = addEventFor(req, "库存", `${id} 已模拟补货入库，相关工单齐套状态重新计算`);
    audit(currentActor(req), "replenish_material", id, before, db.prepare("SELECT * FROM materials WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/lines\/[^/]+\/inspect$/)) {
    const id = path.split("/")[3];
    const line = db.prepare("SELECT * FROM lines WHERE id = ?").get(id);
    if (!line) return sendJson(res, 404, { error: "Line not found" });
    const event = addEventFor(req, "系统", `${line.name} 的产线对象详情已打开，关联工单、设备与权限关系已加载`);
    audit(currentActor(req), "inspect_line_model", id, line, line);
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/model\/[^/]+\/inspect$/)) {
    const id = path.split("/")[3];
    const line = db.prepare("SELECT * FROM lines WHERE id = ?").get(id);
    const labels = {
      TENANT: "集团租户",
      "PLANT-EAST": "华东一厂",
      QC: "质检中心",
      WH: "中央仓",
      EAM: "设备台账",
    };
    const label = line?.name || labels[id] || id;
    const event = addEventFor(req, "系统", `${label} 的模型对象详情已打开，关系、权限和关联业务已加载`);
    audit(currentActor(req), "inspect_model_node", id, line || { id, label }, line || { id, label });
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/routes\/[^/]+\/publish$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM process_routes WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Process route not found" });

    const steps = parse(before.steps, []).map((step) => ({ ...step, status: "已发布" }));
    db.prepare("UPDATE process_routes SET status = '已发布', steps = ? WHERE id = ?").run(json(steps), id);

    if (id === "PR-3003") {
      const order = db.prepare("SELECT * FROM work_orders WHERE id = 'WO-61928'").get();
      if (order) {
        const blockers = parse(order.blockers, []).filter((blocker) => blocker !== "外协首件未确认");
        db.prepare("UPDATE work_orders SET blockers = ?, status = CASE WHEN ? = 0 THEN '正常' ELSE status END WHERE id = 'WO-61928'").run(json(blockers), blockers.length);
        audit(currentActor(req), "release_route_to_order", "WO-61928", order, db.prepare("SELECT * FROM work_orders WHERE id = 'WO-61928'").get());
      }
    }

    const after = db.prepare("SELECT * FROM process_routes WHERE id = ?").get(id);
    const event = addEventFor(req, "系统", `${before.product} ${before.version} 工艺路线已发布，BOM、工序、SOP 与二维码 ${before.qr_code} 已同步到现场`);
    audit(currentActor(req), "publish_process_route", id, before, after);
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/kanban\/[^/]+\/publish$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM kanban_boards WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Kanban board not found" });

    db.prepare("UPDATE kanban_boards SET status = '已发布', last_published = '刚刚' WHERE id = ?").run(id);
    const event = addEventFor(req, "系统", `${before.name} 已发布到 ${before.audience}，${before.widgets ? JSON.parse(before.widgets).length : 0} 个看板组件进入实时刷新`);
    audit(currentActor(req), "publish_kanban_board", id, before, db.prepare("SELECT * FROM kanban_boards WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/equipment\/[^/]+\/check$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM equipment_assets WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Equipment asset not found" });

    db.prepare(`
      UPDATE equipment_assets
      SET status = '运行',
          health = min(health + 8, 100),
          temperature = max(temperature - 3, 35),
          vibration = max(vibration - 0.5, 0.8),
          next_maintenance = '7 天后'
      WHERE id = ?
    `).run(id);

    const after = db.prepare("SELECT * FROM equipment_assets WHERE id = ?").get(id);
    const event = addEventFor(req, "生产", `${before.name} 已完成点检保养，IoT 健康状态与产线运行态已更新`);
    audit(currentActor(req), "complete_equipment_check", id, before, after);
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/insights\/[^/]+\/resolve$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM intelligence_insights WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Intelligence insight not found" });

    db.prepare("UPDATE intelligence_insights SET status = '已处理' WHERE id = ?").run(id);

    let event;
    if (before.linked_entity === "WO-61872") {
      const order = db.prepare("SELECT * FROM work_orders WHERE id = 'WO-61872'").get();
      if (order) {
        const blockers = parse(order.blockers, []).filter((blocker) => blocker !== "L1 负载高");
        db.prepare("UPDATE work_orders SET line = 'L3', status = '正常', progress = min(progress + 6, 100), blockers = ? WHERE id = 'WO-61872'").run(json(blockers));
        audit(currentActor(req), "resolve_intelligence_order", "WO-61872", order, db.prepare("SELECT * FROM work_orders WHERE id = 'WO-61872'").get());
      }
      event = addEventFor(req, "计划", "数据智能已处理 WO-61872 准交风险：排程、质量复核与现场动作已联动");
    } else if (before.linked_entity === "M-884") {
      const material = db.prepare("SELECT * FROM materials WHERE id = 'M-884'").get();
      if (material) {
        db.prepare("UPDATE materials SET stock = stock + 260 WHERE id = 'M-884'").run();
        audit(currentActor(req), "resolve_intelligence_inventory", "M-884", material, db.prepare("SELECT * FROM materials WHERE id = 'M-884'").get());
      }
      event = addEventFor(req, "库存", "数据智能已处理 M-884 缺料洞察：补货任务与替代料评估已生成");
    } else if (before.linked_entity.startsWith("EQ-")) {
      const asset = db.prepare("SELECT * FROM equipment_assets WHERE id = ?").get(before.linked_entity);
      if (asset) {
        db.prepare("UPDATE equipment_assets SET health = min(health + 5, 100), status = '运行' WHERE id = ?").run(before.linked_entity);
        audit(currentActor(req), "resolve_intelligence_equipment", before.linked_entity, asset, db.prepare("SELECT * FROM equipment_assets WHERE id = ?").get(before.linked_entity));
      }
      event = addEventFor(req, "生产", "数据智能已处理设备健康洞察：点检计划与产线影响评估已同步");
    } else {
      const issue = db.prepare("SELECT * FROM quality_issues WHERE id = ?").get(before.linked_entity);
      if (issue) {
        db.prepare("UPDATE quality_issues SET status = '处理中' WHERE id = ?").run(before.linked_entity);
        audit(currentActor(req), "resolve_intelligence_quality", before.linked_entity, issue, db.prepare("SELECT * FROM quality_issues WHERE id = ?").get(before.linked_entity));
      }
      event = addEventFor(req, "质量", "数据智能已处理质量 SLA 洞察：QA 复核与追溯样本已升级");
    }

    const after = db.prepare("SELECT * FROM intelligence_insights WHERE id = ?").get(id);
    audit(currentActor(req), "resolve_intelligence_insight", id, before, after);
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path === "/api/events/exception") {
    const before = db.prepare("SELECT * FROM work_orders WHERE id = 'WO-61904'").get();
    const blockers = Array.from(new Set([...parse(before.blockers, []), "设备振动超阈值"]));
    db.prepare("UPDATE work_orders SET status = '风险', blockers = ? WHERE id = 'WO-61904'").run(json(blockers));
    const event = addEventFor(req, "生产", "L3 设备振动超阈值，WO-61904 自动进入风险队列");
    audit(currentActor(req), "trigger_exception", "WO-61904", before, db.prepare("SELECT * FROM work_orders WHERE id = 'WO-61904'").get());
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/rules\/[^/]+\/toggle$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM rules WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Rule not found" });
    db.prepare("UPDATE rules SET enabled = CASE enabled WHEN 1 THEN 0 ELSE 1 END WHERE id = ?").run(id);
    const event = addEventFor(req, "系统", `${before.name} 已${before.enabled ? "停用" : "启用"}`);
    audit(currentActor(req), "toggle_rule", id, before, db.prepare("SELECT * FROM rules WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/integrations\/[^/]+\/sync$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM integrations WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Integration not found" });
    db.prepare("UPDATE integrations SET status = '已连接', last_sync = '刚刚' WHERE id = ?").run(id);
    const event = addEventFor(req, "系统", `${before.name} 已完成一次手动同步`);
    audit(currentActor(req), "sync_integration", id, before, db.prepare("SELECT * FROM integrations WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/implementation\/[^/]+\/advance$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM implementation_phases WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Implementation phase not found" });
    const activePhase = db.prepare("SELECT * FROM implementation_phases WHERE status = '进行中' ORDER BY sort_order LIMIT 1").get();
    if (before.status === "待开始" && activePhase) {
      return sendJson(res, 409, { error: `请先完成当前阶段：${activePhase.name}` });
    }

    const nextStatus = before.status === "待开始" ? "进行中" : "已完成";
    db.prepare("UPDATE implementation_phases SET status = ? WHERE id = ?").run(nextStatus, id);

    if (nextStatus === "已完成") {
      const nextPhase = db.prepare("SELECT * FROM implementation_phases WHERE sort_order > ? AND status = '待开始' ORDER BY sort_order LIMIT 1").get(before.sort_order);
      if (nextPhase) db.prepare("UPDATE implementation_phases SET status = '进行中' WHERE id = ?").run(nextPhase.id);
    }

    const after = db.prepare("SELECT * FROM implementation_phases WHERE id = ?").get(id);
    const event = addEventFor(req, "系统", `${before.name} 已推进为${nextStatus}，上线蓝图与审计记录已同步`);
    audit(currentActor(req), "advance_implementation_phase", id, before, after);
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/mobile\/[^/]+\/complete$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM mobile_tasks WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Mobile task not found" });

    db.prepare("UPDATE mobile_tasks SET status = '已完成' WHERE id = ?").run(id);

    let event;
    if (before.type === "报工") {
      const order = db.prepare("SELECT * FROM work_orders WHERE id = ?").get(before.target);
      if (order) {
        const nextProgress = Math.min(order.progress + 12, 100);
        db.prepare("UPDATE work_orders SET progress = ?, status = CASE WHEN ? = 100 THEN '完成' ELSE status END WHERE id = ?").run(nextProgress, nextProgress, before.target);
        audit(currentActor(req), "mobile_report_work", before.target, order, db.prepare("SELECT * FROM work_orders WHERE id = ?").get(before.target));
      }
      event = addEventFor(req, "生产", `${before.title} 已通过移动端扫码报工，现场进度同步到排程`);
    } else if (before.type === "发料") {
      const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(before.target);
      if (material) {
        db.prepare("UPDATE materials SET stock = max(stock - 80, 0) WHERE id = ?").run(before.target);
        audit(currentActor(req), "mobile_issue_material", before.target, material, db.prepare("SELECT * FROM materials WHERE id = ?").get(before.target));
      }
      event = addEventFor(req, "库存", `${before.title} 已通过移动端扫码发料，库存与工单齐套状态已更新`);
    } else {
      const issue = db.prepare("SELECT * FROM quality_issues WHERE id = ?").get(before.target);
      if (issue) {
        db.prepare("UPDATE quality_issues SET status = '已关闭' WHERE id = ?").run(before.target);
        audit(currentActor(req), "mobile_quality_confirm", before.target, issue, db.prepare("SELECT * FROM quality_issues WHERE id = ?").get(before.target));
      }
      event = addEventFor(req, "质量", `${before.title} 已通过移动端扫码确认，批次追溯链已归档`);
    }

    audit(currentActor(req), "complete_mobile_task", id, before, db.prepare("SELECT * FROM mobile_tasks WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/templates\/[^/]+\/apply$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM industry_templates WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Industry template not found" });

    db.prepare("UPDATE industry_templates SET status = '可启用' WHERE id <> ?").run(id);
    db.prepare("UPDATE industry_templates SET status = '已启用' WHERE id = ?").run(id);

    const after = db.prepare("SELECT * FROM industry_templates WHERE id = ?").get(id);
    const event = addEventFor(req, "系统", `${before.name} 已启用：模块、角色、字段与上线节奏已进入租户配置`);
    audit(currentActor(req), "apply_industry_template", id, before, after);
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path.match(/^\/api\/workflows\/[^/]+\/advance$/)) {
    const id = path.split("/")[3];
    const before = db.prepare("SELECT * FROM workflow_instances WHERE id = ?").get(id);
    if (!before) return sendJson(res, 404, { error: "Workflow instance not found" });

    const steps = parse(before.steps, []);
    const nextStep = Math.min(before.current_step + 1, Math.max(steps.length - 1, 0));
    const nextStatus = nextStep >= steps.length - 1 ? "已完成" : "进行中";
    db.prepare("UPDATE workflow_instances SET current_step = ?, status = ? WHERE id = ?").run(nextStep, nextStatus, id);

    const event = addEventFor(req, "系统", `${before.name} 已推进到 ${steps[nextStep] || "完成"}，流程节点与审计记录已同步`);
    audit(currentActor(req), "advance_workflow", id, before, db.prepare("SELECT * FROM workflow_instances WHERE id = ?").get(id));
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path === "/api/admin/reset") {
    db.exec("DELETE FROM meta");
    db.exec("DELETE FROM tenants; DELETE FROM users; DELETE FROM commercial_packages; DELETE FROM sales_opportunities; DELETE FROM activation_tasks; DELETE FROM master_data_checks; DELETE FROM lines; DELETE FROM process_routes; DELETE FROM kanban_boards; DELETE FROM equipment_assets; DELETE FROM work_orders; DELETE FROM materials; DELETE FROM quality_issues; DELETE FROM events; DELETE FROM recommendations; DELETE FROM intelligence_insights; DELETE FROM rules; DELETE FROM integrations; DELETE FROM implementation_phases; DELETE FROM mobile_tasks; DELETE FROM industry_templates; DELETE FROM workflow_instances; DELETE FROM audit_logs;");
    migrate();
    const event = addEventFor(req, "系统", "演示环境已重置为种子数据");
    return respondWithSnapshot(req, res, event);
  }

  if (req.method === "POST" && path === "/api/admin/database/backup") {
    const status = createDatabaseBackup(currentActor(req));
    const event = addEventFor(req, "系统", `数据库备份已生成：${status.backups[0]?.name || "backup.sqlite"}`);
    return respondWithSnapshot(req, res, event);
  }

  return sendJson(res, 404, { error: "API route not found" });
}

function serveStatic(req, res, path) {
  const pathname = path === "/" ? "/index.html" : path;
  const filePath = join(distDir, pathname);
  const resolved = resolve(filePath);
  const target = resolved.startsWith(distDir) && existsSync(resolved) && statSync(resolved).isFile()
    ? resolved
    : join(distDir, "index.html");
  res.writeHead(200, { "content-type": mime[extname(target)] || "application/octet-stream" });
  createReadStream(target).pipe(res);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      return await handleApi(req, res, url.pathname, await readBody(req));
    }
    return serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: "Internal server error", detail: error.message });
  }
}).listen(port, () => {
  console.log(`ZhuYun SaaS server listening on http://127.0.0.1:${port}`);
});
