import { DatabaseSync } from "node:sqlite";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { seed } from "./seed-data.js";

const dbPath = resolve("data/zhuyun.sqlite");
const backupDir = resolve("data/backups");
mkdirSync(dirname(dbPath), { recursive: true });
mkdirSync(backupDir, { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

const json = (value) => JSON.stringify(value);
const parse = (value, fallback = null) => (value ? JSON.parse(value) : fallback);

const managedTables = [
  ["tenants", "租户"],
  ["users", "员工与权限"],
  ["work_orders", "工单"],
  ["materials", "物料库存"],
  ["quality_issues", "质量问题"],
  ["lines", "产线"],
  ["process_routes", "工艺路线"],
  ["kanban_boards", "看板"],
  ["equipment_assets", "设备台账"],
  ["sales_opportunities", "商机"],
  ["activation_tasks", "客户启动任务"],
  ["master_data_checks", "主数据校验"],
  ["workflow_instances", "流程实例"],
  ["integrations", "集成连接"],
  ["rules", "规则"],
  ["events", "事件流"],
  ["audit_logs", "审计日志"],
];

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((item) => item.name);
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan TEXT NOT NULL,
      plants INTEGER NOT NULL,
      lines INTEGER NOT NULL,
      users INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      role_key TEXT NOT NULL DEFAULT 'planner',
      department TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      plant TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '离线',
      last_active TEXT NOT NULL DEFAULT '',
      permissions TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS commercial_packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target TEXT NOT NULL,
      price_model TEXT NOT NULL,
      scope TEXT NOT NULL,
      implementation TEXT NOT NULL,
      roi TEXT NOT NULL,
      status TEXT NOT NULL,
      modules TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sales_opportunities (
      id TEXT PRIMARY KEY,
      package_id TEXT NOT NULL,
      customer TEXT NOT NULL,
      owner TEXT NOT NULL,
      stage TEXT NOT NULL,
      next_step TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activation_tasks (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      owner TEXT NOT NULL,
      workspace TEXT NOT NULL,
      first_action TEXT NOT NULL,
      success_metric TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS master_data_checks (
      id TEXT PRIMARY KEY,
      domain TEXT NOT NULL,
      owner TEXT NOT NULL,
      source TEXT NOT NULL,
      readiness INTEGER NOT NULL,
      issues INTEGER NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plant TEXT NOT NULL,
      status TEXT NOT NULL,
      oee INTEGER NOT NULL,
      load INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS process_routes (
      id TEXT PRIMARY KEY,
      product TEXT NOT NULL,
      version TEXT NOT NULL,
      line TEXT NOT NULL,
      owner TEXT NOT NULL,
      cycle_time TEXT NOT NULL,
      qr_code TEXT NOT NULL,
      status TEXT NOT NULL,
      bom TEXT NOT NULL,
      steps TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS kanban_boards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      audience TEXT NOT NULL,
      scope TEXT NOT NULL,
      refresh_rate TEXT NOT NULL,
      layout TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL,
      last_published TEXT NOT NULL,
      widgets TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS equipment_assets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      line TEXT NOT NULL,
      plant TEXT NOT NULL,
      status TEXT NOT NULL,
      health INTEGER NOT NULL,
      oee INTEGER NOT NULL,
      temperature INTEGER NOT NULL,
      vibration REAL NOT NULL,
      next_maintenance TEXT NOT NULL,
      owner TEXT NOT NULL,
      sensors TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS work_orders (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      sku TEXT NOT NULL,
      line TEXT NOT NULL,
      due TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL,
      blockers TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stock INTEGER NOT NULL,
      safe_stock INTEGER NOT NULL,
      location TEXT NOT NULL,
      linked_orders TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quality_issues (
      id TEXT PRIMARY KEY,
      batch TEXT NOT NULL,
      severity TEXT NOT NULL,
      source TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL,
      root_cause TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT '系统',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      impact TEXT NOT NULL,
      accepted INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS intelligence_insights (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      domain TEXT NOT NULL,
      severity TEXT NOT NULL,
      metric TEXT NOT NULL,
      value TEXT NOT NULL,
      change TEXT NOT NULL,
      source TEXT NOT NULL,
      linked_entity TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      module TEXT NOT NULL,
      enabled INTEGER NOT NULL,
      threshold TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      last_sync TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS implementation_phases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL,
      detail TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mobile_tasks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      target TEXT NOT NULL,
      scan_code TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL,
      instruction TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS industry_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      fit TEXT NOT NULL,
      modules TEXT NOT NULL,
      roles TEXT NOT NULL,
      fields TEXT NOT NULL,
      rollout TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workflow_instances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      business_key TEXT NOT NULL,
      owner TEXT NOT NULL,
      sla TEXT NOT NULL,
      current_step INTEGER NOT NULL,
      status TEXT NOT NULL,
      steps TEXT NOT NULL,
      route TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      before_json TEXT,
      after_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  ensureColumn("users", "email", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("users", "role_key", "TEXT NOT NULL DEFAULT 'planner'");
  ensureColumn("users", "department", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("users", "title", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("users", "plant", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("users", "status", "TEXT NOT NULL DEFAULT '离线'");
  ensureColumn("users", "last_active", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("events", "actor", "TEXT NOT NULL DEFAULT '系统'");

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  if (!userCount.count || userCount.count < seed.users.length) {
    db.prepare("DELETE FROM users").run();
    const userInsert = db.prepare("INSERT INTO users (id, name, role, email, role_key, department, title, plant, status, last_active, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.users.forEach((user) =>
      userInsert.run(user.id, user.name, user.role, user.email, user.roleKey, user.department, user.title, user.plant, user.status, user.lastActive, json(user.permissions)),
    );
  }

  const phaseCount = db.prepare("SELECT COUNT(*) as count FROM implementation_phases").get();
  if (!phaseCount.count) {
    const phaseInsert = db.prepare("INSERT INTO implementation_phases VALUES (?, ?, ?, ?, ?, ?, ?)");
    seed.implementationPhases.forEach((phase, index) =>
      phaseInsert.run(phase.id, phase.name, phase.owner, phase.time, phase.status, phase.detail, index),
    );
  }

  const packageCount = db.prepare("SELECT COUNT(*) as count FROM commercial_packages").get();
  if (!packageCount.count) {
    const packageInsert = db.prepare("INSERT INTO commercial_packages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.commercialPackages.forEach((item) =>
      packageInsert.run(item.id, item.name, item.target, item.priceModel, item.scope, item.implementation, item.roi, item.status, json(item.modules)),
    );
  }

  const opportunityCount = db.prepare("SELECT COUNT(*) as count FROM sales_opportunities").get();
  if (!opportunityCount.count) {
    const opportunityInsert = db.prepare("INSERT INTO sales_opportunities VALUES (?, ?, ?, ?, ?, ?, ?)");
    seed.salesOpportunities.forEach((item) =>
      opportunityInsert.run(item.id, item.packageId, item.customer, item.owner, item.stage, item.nextStep, item.status),
    );
  }

  const activationCount = db.prepare("SELECT COUNT(*) as count FROM activation_tasks").get();
  if (!activationCount.count) {
    const activationInsert = db.prepare("INSERT INTO activation_tasks VALUES (?, ?, ?, ?, ?, ?, ?)");
    seed.activationTasks.forEach((item) =>
      activationInsert.run(item.id, item.role, item.owner, item.workspace, item.firstAction, item.successMetric, item.status),
    );
  }

  const masterDataCount = db.prepare("SELECT COUNT(*) as count FROM master_data_checks").get();
  if (!masterDataCount.count) {
    const masterDataInsert = db.prepare("INSERT INTO master_data_checks VALUES (?, ?, ?, ?, ?, ?, ?)");
    seed.masterDataChecks.forEach((item) =>
      masterDataInsert.run(item.id, item.domain, item.owner, item.source, item.readiness, item.issues, item.status),
    );
  }

  const mobileCount = db.prepare("SELECT COUNT(*) as count FROM mobile_tasks").get();
  if (!mobileCount.count) {
    const mobileInsert = db.prepare("INSERT INTO mobile_tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    seed.mobileTasks.forEach((task) =>
      mobileInsert.run(task.id, task.type, task.title, task.target, task.scanCode, task.owner, task.status, task.instruction),
    );
  }

  const templateCount = db.prepare("SELECT COUNT(*) as count FROM industry_templates").get();
  if (!templateCount.count) {
    const templateInsert = db.prepare("INSERT INTO industry_templates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.industryTemplates.forEach((template) =>
      templateInsert.run(
        template.id,
        template.name,
        template.industry,
        template.fit,
        json(template.modules),
        json(template.roles),
        json(template.fields),
        template.rollout,
        template.status,
      ),
    );
  }

  const workflowCount = db.prepare("SELECT COUNT(*) as count FROM workflow_instances").get();
  if (!workflowCount.count) {
    const workflowInsert = db.prepare("INSERT INTO workflow_instances VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.workflowInstances.forEach((workflow) =>
      workflowInsert.run(
        workflow.id,
        workflow.name,
        workflow.category,
        workflow.businessKey,
        workflow.owner,
        workflow.sla,
        workflow.currentStep,
        workflow.status,
        json(workflow.steps),
        workflow.route,
      ),
    );
  }

  const equipmentCount = db.prepare("SELECT COUNT(*) as count FROM equipment_assets").get();
  if (!equipmentCount.count) {
    const equipmentInsert = db.prepare("INSERT INTO equipment_assets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.equipmentAssets.forEach((asset) =>
      equipmentInsert.run(
        asset.id,
        asset.name,
        asset.line,
        asset.plant,
        asset.status,
        asset.health,
        asset.oee,
        asset.temperature,
        asset.vibration,
        asset.nextMaintenance,
        asset.owner,
        json(asset.sensors),
      ),
    );
  }

  const routeCount = db.prepare("SELECT COUNT(*) as count FROM process_routes").get();
  if (!routeCount.count) {
    const routeInsert = db.prepare("INSERT INTO process_routes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.processRoutes.forEach((route) =>
      routeInsert.run(
        route.id,
        route.product,
        route.version,
        route.line,
        route.owner,
        route.cycleTime,
        route.qrCode,
        route.status,
        json(route.bom),
        json(route.steps),
      ),
    );
  }

  const kanbanCount = db.prepare("SELECT COUNT(*) as count FROM kanban_boards").get();
  if (!kanbanCount.count) {
    const kanbanInsert = db.prepare("INSERT INTO kanban_boards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.kanbanBoards.forEach((board) =>
      kanbanInsert.run(
        board.id,
        board.name,
        board.audience,
        board.scope,
        board.refreshRate,
        board.layout,
        board.owner,
        board.status,
        board.lastPublished,
        json(board.widgets),
      ),
    );
  }

  const insightCount = db.prepare("SELECT COUNT(*) as count FROM intelligence_insights").get();
  if (!insightCount.count) {
    const insightInsert = db.prepare("INSERT INTO intelligence_insights VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.intelligenceInsights.forEach((insight) =>
      insightInsert.run(
        insight.id,
        insight.title,
        insight.domain,
        insight.severity,
        insight.metric,
        insight.value,
        insight.change,
        insight.source,
        insight.linkedEntity,
        insight.recommendation,
        insight.owner,
        insight.status,
      ),
    );
  }

  const seeded = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
  if (seeded) return;

  try {
    db.exec("BEGIN");
    db.prepare("INSERT INTO tenants VALUES (?, ?, ?, ?, ?, ?)").run(
      seed.tenant.id,
      seed.tenant.name,
      seed.tenant.plan,
      seed.tenant.plants,
      seed.tenant.lines,
      seed.tenant.users,
    );
    const lineInsert = db.prepare("INSERT INTO lines VALUES (?, ?, ?, ?, ?, ?)");
    seed.lines.forEach((line) => lineInsert.run(line.id, line.name, line.plant, line.status, line.oee, line.load));

    const orderInsert = db.prepare("INSERT INTO work_orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    seed.orders.forEach((order) =>
      orderInsert.run(order.id, order.customer, order.sku, order.line, order.due, order.priority, order.status, order.progress, json(order.blockers)),
    );

    const materialInsert = db.prepare("INSERT INTO materials VALUES (?, ?, ?, ?, ?, ?)");
    seed.materials.forEach((material) =>
      materialInsert.run(material.id, material.name, material.stock, material.safeStock, material.location, json(material.linkedOrders)),
    );

    const issueInsert = db.prepare("INSERT INTO quality_issues VALUES (?, ?, ?, ?, ?, ?, ?)");
    seed.qualityIssues.forEach((issue) =>
      issueInsert.run(issue.id, issue.batch, issue.severity, issue.source, issue.owner, issue.status, issue.rootCause),
    );

    const eventInsert = db.prepare("INSERT INTO events (id, time, type, message, actor) VALUES (?, ?, ?, ?, ?)");
    seed.events.forEach((event) => eventInsert.run(event.id, event.time, event.type, event.message, event.actor || "系统"));

    const recInsert = db.prepare("INSERT INTO recommendations VALUES (?, ?, ?, ?, ?, ?)");
    seed.recommendations.forEach((rec) => recInsert.run(rec.id, rec.severity, rec.title, rec.body, rec.impact, rec.accepted ? 1 : 0));

    const ruleInsert = db.prepare("INSERT INTO rules VALUES (?, ?, ?, ?, ?)");
    seed.rules.forEach((rule) => ruleInsert.run(rule.id, rule.name, rule.module, rule.enabled ? 1 : 0, rule.threshold));

    const integrationInsert = db.prepare("INSERT INTO integrations VALUES (?, ?, ?, ?, ?)");
    seed.integrations.forEach((integration) =>
      integrationInsert.run(integration.id, integration.name, integration.type, integration.status, integration.lastSync),
    );

    db.prepare("INSERT INTO meta VALUES ('seeded', '1')").run();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    roleKey: row.role_key,
    department: row.department,
    title: row.title,
    plant: row.plant,
    status: row.status,
    lastActive: row.last_active,
    permissions: parse(row.permissions, []),
  };
}

export function getUser(userId) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  return row ? mapUser(row) : null;
}

export function touchUser(userId) {
  db.prepare("UPDATE users SET status = '在线', last_active = '刚刚' WHERE id = ?").run(userId);
}

export function snapshot(userId = "U-1001") {
  const tenant = db.prepare("SELECT * FROM tenants LIMIT 1").get();
  const currentUser = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) || db.prepare("SELECT * FROM users ORDER BY id LIMIT 1").get();
  const orders = db.prepare("SELECT * FROM work_orders ORDER BY priority, id").all().map((row) => ({
    id: row.id,
    customer: row.customer,
    sku: row.sku,
    line: row.line,
    due: row.due,
    priority: row.priority,
    status: row.status,
    progress: row.progress,
    blockers: parse(row.blockers, []),
  }));
  const materials = db.prepare("SELECT * FROM materials ORDER BY id").all().map((row) => ({
    id: row.id,
    name: row.name,
    stock: row.stock,
    safeStock: row.safe_stock,
    location: row.location,
    linkedOrders: parse(row.linked_orders, []),
  }));
  const qualityIssues = db.prepare("SELECT * FROM quality_issues ORDER BY id").all().map((row) => ({
    id: row.id,
    batch: row.batch,
    severity: row.severity,
    source: row.source,
    owner: row.owner,
    status: row.status,
    rootCause: row.root_cause,
  }));

  return {
    tenant,
    currentUser: currentUser ? mapUser(currentUser) : null,
    users: db.prepare("SELECT * FROM users ORDER BY CASE status WHEN '在线' THEN 0 ELSE 1 END, id").all().map(mapUser),
    commercialPackages: db.prepare("SELECT id, name, target, price_model as priceModel, scope, implementation, roi, status, modules FROM commercial_packages ORDER BY status DESC, id").all().map((row) => ({
      ...row,
      modules: parse(row.modules, []),
    })),
    salesOpportunities: db.prepare("SELECT id, package_id as packageId, customer, owner, stage, next_step as nextStep, status FROM sales_opportunities ORDER BY id DESC LIMIT 12").all(),
    activationTasks: db.prepare("SELECT id, role, owner, workspace, first_action as firstAction, success_metric as successMetric, status FROM activation_tasks ORDER BY status DESC, id").all(),
    masterDataChecks: db.prepare("SELECT id, domain, owner, source, readiness, issues, status FROM master_data_checks ORDER BY status DESC, readiness").all(),
    lines: db.prepare("SELECT * FROM lines ORDER BY id").all(),
    processRoutes: db.prepare("SELECT id, product, version, line, owner, cycle_time as cycleTime, qr_code as qrCode, status, bom, steps FROM process_routes ORDER BY status, id").all().map((row) => ({
      ...row,
      bom: parse(row.bom, []),
      steps: parse(row.steps, []),
    })),
    kanbanBoards: db.prepare("SELECT id, name, audience, scope, refresh_rate as refreshRate, layout, owner, status, last_published as lastPublished, widgets FROM kanban_boards ORDER BY status, id").all().map((row) => ({
      ...row,
      widgets: parse(row.widgets, []),
    })),
    equipmentAssets: db.prepare("SELECT id, name, line, plant, status, health, oee, temperature, vibration, next_maintenance as nextMaintenance, owner, sensors FROM equipment_assets ORDER BY status, id").all().map((row) => ({
      ...row,
      sensors: parse(row.sensors, []),
    })),
    orders,
    materials,
    qualityIssues,
    events: db.prepare("SELECT id, time, type, message, actor FROM events ORDER BY rowid DESC LIMIT 20").all(),
    recommendations: db.prepare("SELECT id, severity, title, body, impact, accepted FROM recommendations ORDER BY accepted, severity").all().map((row) => ({
      ...row,
      accepted: Boolean(row.accepted),
    })),
    intelligenceInsights: db.prepare(`
      SELECT id, title, domain, severity, metric, value, change, source, linked_entity as linkedEntity, recommendation, owner, status
      FROM intelligence_insights
      ORDER BY
        CASE status WHEN '待处理' THEN 0 ELSE 1 END,
        CASE severity WHEN '高' THEN 0 WHEN '中' THEN 1 ELSE 2 END,
        id
    `).all(),
    rules: db.prepare("SELECT id, name, module, enabled, threshold FROM rules ORDER BY id").all().map((row) => ({ ...row, enabled: Boolean(row.enabled) })),
    integrations: db.prepare("SELECT id, name, type, status, last_sync as lastSync FROM integrations ORDER BY id").all(),
    implementationPhases: db.prepare("SELECT id, name, owner, time, status, detail FROM implementation_phases ORDER BY sort_order").all(),
    mobileTasks: db.prepare("SELECT id, type, title, target, scan_code as scanCode, owner, status, instruction FROM mobile_tasks ORDER BY status DESC, id").all(),
    industryTemplates: db.prepare("SELECT id, name, industry, fit, modules, roles, fields, rollout, status FROM industry_templates ORDER BY status DESC, id").all().map((row) => ({
      ...row,
      modules: parse(row.modules, []),
      roles: parse(row.roles, []),
      fields: parse(row.fields, []),
    })),
    workflowInstances: db.prepare("SELECT id, name, category, business_key as businessKey, owner, sla, current_step as currentStep, status, steps, route FROM workflow_instances ORDER BY status DESC, id").all().map((row) => ({
      ...row,
      steps: parse(row.steps, []),
    })),
    auditLogs: db.prepare("SELECT id, actor, action, entity, created_at as createdAt FROM audit_logs ORDER BY rowid DESC LIMIT 30").all(),
    databaseAdmin: databaseAdminStatus(),
  };
}

export function databaseAdminStatus() {
  const file = existsSync(dbPath) ? statSync(dbPath) : null;
  const walPath = `${dbPath}-wal`;
  const shmPath = `${dbPath}-shm`;
  const backups = readdirSync(backupDir)
    .filter((name) => name.endsWith(".sqlite"))
    .map((name) => {
      const fullPath = resolve(backupDir, name);
      const stat = statSync(fullPath);
      return {
        id: name,
        name,
        path: fullPath,
        sizeKb: Math.round(stat.size / 1024),
        createdAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const tables = managedTables.map(([name, label]) => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get().count;
    const columns = db.prepare(`PRAGMA table_info(${name})`).all().length;
    return { name, label, rows: count, columns };
  });

  return {
    engine: "SQLite / node:sqlite",
    mode: "WAL",
    path: dbPath,
    sizeKb: file ? Math.round(file.size / 1024) : 0,
    walKb: existsSync(walPath) ? Math.round(statSync(walPath).size / 1024) : 0,
    shmKb: existsSync(shmPath) ? Math.round(statSync(shmPath).size / 1024) : 0,
    status: "健康",
    tableCount: tables.length,
    totalRows: tables.reduce((sum, table) => sum + table.rows, 0),
    tables,
    backups,
  };
}

export function createDatabaseBackup(actor = "系统") {
  db.exec("PRAGMA wal_checkpoint(FULL)");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `zhuyun-${stamp}.sqlite`;
  const target = resolve(backupDir, fileName);
  copyFileSync(dbPath, target);
  audit(actor, "backup_database", fileName, null, { path: target });
  return databaseAdminStatus();
}

export function addEvent(type, message, actor = "系统") {
  const event = { id: `E-${Date.now()}`, time: "刚刚", type, message, actor };
  db.prepare("INSERT INTO events (id, time, type, message, actor) VALUES (?, ?, ?, ?, ?)").run(event.id, event.time, event.type, event.message, event.actor);
  return event;
}

export function audit(actor, action, entity, beforeValue, afterValue) {
  db.prepare("INSERT INTO audit_logs (id, actor, action, entity, before_json, after_json) VALUES (?, ?, ?, ?, ?, ?)").run(
    `A-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    actor,
    action,
    entity,
    beforeValue ? json(beforeValue) : null,
    afterValue ? json(afterValue) : null,
  );
}

export { json, parse };
