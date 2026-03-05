const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db;
let SQL;

async function getDb() {
  if (!db) {
    SQL = await require('sql.js')();
    const dbPath = path.join(app.getPath('userData'), 'forge.db');
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    db.pragma = () => {};
    initSchema();
    saveDb();
  }
  return db;
}

function saveDb() {
  try {
    const dbPath = path.join(app.getPath('userData'), 'forge.db');
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch(e) {}
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

function all(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch(e) { return []; }
}

function get(sql, params = []) {
  return all(sql, params)[0] || null;
}

function initSchema() {
  run(`CREATE TABLE IF NOT EXISTS channels(id TEXT PRIMARY KEY,name TEXT NOT NULL,preset TEXT NOT NULL DEFAULT 'long',youtube_channel_id TEXT,style_prompt TEXT,voice_profile TEXT DEFAULT 'default',publish_schedule TEXT DEFAULT '0 18 * * *',auto_approve INTEGER DEFAULT 0,target_length_min INTEGER DEFAULT 20,target_length_max INTEGER DEFAULT 90,branding TEXT DEFAULT '{}',content_sources TEXT DEFAULT '[]',created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now')))`);
  run(`CREATE TABLE IF NOT EXISTS videos(id TEXT PRIMARY KEY,channel_id TEXT NOT NULL,title TEXT,script TEXT,status TEXT DEFAULT 'pending',stage TEXT DEFAULT 'ingest',preset TEXT DEFAULT 'long',target_length INTEGER,actual_length INTEGER,file_path TEXT,thumbnail_path TEXT,youtube_video_id TEXT,youtube_title TEXT,youtube_description TEXT,youtube_tags TEXT DEFAULT '[]',approved_at TEXT,published_at TEXT,metadata TEXT DEFAULT '{}',created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now')))`);
  run(`CREATE TABLE IF NOT EXISTS ideas(id TEXT PRIMARY KEY,channel_id TEXT NOT NULL,title TEXT NOT NULL,directive TEXT,description TEXT,keywords TEXT DEFAULT '[]',sources TEXT,status TEXT DEFAULT 'backlog',priority TEXT DEFAULT 'medium',preset TEXT DEFAULT 'long',target_length TEXT DEFAULT '40-90',tags TEXT DEFAULT '[]',created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now')))`);
  run(`CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,type TEXT NOT NULL,video_id TEXT,channel_id TEXT,agent TEXT,status TEXT DEFAULT 'queued',progress INTEGER DEFAULT 0,result TEXT,error TEXT,started_at TEXT,completed_at TEXT,scheduled_for TEXT,created_at TEXT DEFAULT(datetime('now')))`);
  run(`CREATE TABLE IF NOT EXISTS prompts(id TEXT PRIMARY KEY,name TEXT NOT NULL,stage TEXT NOT NULL,channel_id TEXT,body TEXT NOT NULL,notes TEXT,created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now')))`);
  run(`CREATE TABLE IF NOT EXISTS agent_config(task_type TEXT PRIMARY KEY,agent TEXT NOT NULL,model TEXT NOT NULL,enabled INTEGER DEFAULT 1,fallback_agent TEXT,fallback_model TEXT)`);
  run(`CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TEXT DEFAULT(datetime('now')))`);
  run(`CREATE TABLE IF NOT EXISTS api_usage(id TEXT PRIMARY KEY,service TEXT NOT NULL,tokens_used INTEGER DEFAULT 0,cost_usd REAL DEFAULT 0,date TEXT DEFAULT(date('now')),created_at TEXT DEFAULT(datetime('now')))`);
}

module.exports = (ipcMain) => {
  ipcMain.handle('db:raw', async (_, sql, params) => {
    const db = await getDb();
    return all(sql, params || []);
  });
};
module.exports.getDb = getDb;
module.exports.run = run;
module.exports.all = all;
module.exports.get = get;