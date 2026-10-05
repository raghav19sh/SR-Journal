import type { SQLiteDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

export type Mood = 'great' | 'good' | 'neutral' | 'low' | 'awful';
export type JournalEntry = {
  id: string;
  entryDate: string;
  videoUri: string;
  durationSeconds: number | null;
  title: string;
  note: string;
  tags: string[];
  mood: Mood | null;
  transcript: string;
  isFavorite: boolean;
  updatedAt: string;
};

export async function initDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys=ON;
    PRAGMA journal_mode=WAL;
    PRAGMA secure_delete=ON;
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      entry_date TEXT NOT NULL,
      video_uri TEXT NOT NULL,
      duration_seconds REAL,
      title TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      mood TEXT,
      transcript TEXT NOT NULL DEFAULT '',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_updated ON journal_entries(updated_at);
  `);
  const migrations = [
    "ALTER TABLE journal_entries ADD COLUMN title TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE journal_entries ADD COLUMN note TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE journal_entries ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE journal_entries ADD COLUMN mood TEXT",
    "ALTER TABLE journal_entries ADD COLUMN transcript TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE journal_entries ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE journal_entries ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP"
  ];
  for (const sql of migrations) {
    try { await db.execAsync(sql); } catch {}
  }
}

function mapRow(row: any): JournalEntry {
  return {
    ...row,
    tags: (() => { try { return JSON.parse(row.tags ?? '[]'); } catch { return []; } })(),
    mood: row.mood ?? null,
    isFavorite: Boolean(row.isFavorite),
  };
}

export async function createEntry(db: SQLiteDatabase, e: JournalEntry) {
  await db.runAsync(
    `INSERT INTO journal_entries
      (id,entry_date,video_uri,duration_seconds,title,note,tags,mood,transcript,is_favorite,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    e.id,e.entryDate,e.videoUri,e.durationSeconds,e.title,e.note,JSON.stringify(e.tags),e.mood,e.transcript,e.isFavorite ? 1 : 0,e.updatedAt
  );
}

export async function getEntry(db: SQLiteDatabase, id: string) {
  const row = await db.getFirstAsync<any>(
    `SELECT id,entry_date as entryDate,video_uri as videoUri,duration_seconds as durationSeconds,
      title,note,tags,mood,transcript,is_favorite as isFavorite,updated_at as updatedAt
      FROM journal_entries WHERE id=?`, id);
  return row ? mapRow(row) : null;
}

export async function getEntriesForDate(db: SQLiteDatabase, dateKey: string) {
  const rows = await db.getAllAsync<any>(
    `SELECT id,entry_date as entryDate,video_uri as videoUri,duration_seconds as durationSeconds,
      title,note,tags,mood,transcript,is_favorite as isFavorite,updated_at as updatedAt
      FROM journal_entries WHERE substr(entry_date,1,10)=? ORDER BY entry_date DESC`, dateKey);
  return rows.map(mapRow);
}

export async function listEntryDates(db: SQLiteDatabase, month: Date) {
  const y=month.getFullYear(), m=String(month.getMonth()+1).padStart(2,'0'), prefix=`${y}-${m}`;
  const rows=await db.getAllAsync<{date:string}>(
    'SELECT DISTINCT substr(entry_date,1,10) as date FROM journal_entries WHERE entry_date LIKE ? ORDER BY date', `${prefix}%`);
  return rows.map(r=>r.date);
}

export async function searchEntries(db: SQLiteDatabase, query: string) {
  const q=`%${query.trim()}%`;
  const rows=await db.getAllAsync<any>(
    `SELECT id,entry_date as entryDate,video_uri as videoUri,duration_seconds as durationSeconds,
      title,note,tags,mood,transcript,is_favorite as isFavorite,updated_at as updatedAt
      FROM journal_entries
      WHERE title LIKE ? OR note LIKE ? OR transcript LIKE ? OR tags LIKE ?
      ORDER BY entry_date DESC LIMIT 100`, q,q,q,q);
  return rows.map(mapRow);
}

export async function updateEntry(db: SQLiteDatabase, e: JournalEntry) {
  const updatedAt=new Date().toISOString();
  await db.runAsync(
    `UPDATE journal_entries SET title=?,note=?,tags=?,mood=?,transcript=?,is_favorite=?,updated_at=? WHERE id=?`,
    e.title,e.note,JSON.stringify(e.tags),e.mood,e.transcript,e.isFavorite ? 1 : 0,updatedAt,e.id
  );
}

export async function getAllEntries(db: SQLiteDatabase) {
  const rows=await db.getAllAsync<any>(
    `SELECT id,entry_date as entryDate,video_uri as videoUri,duration_seconds as durationSeconds,
      title,note,tags,mood,transcript,is_favorite as isFavorite,updated_at as updatedAt
      FROM journal_entries ORDER BY entry_date ASC`);
  return rows.map(mapRow);
}

export async function deleteEntry(db: SQLiteDatabase, e: JournalEntry) {
  await db.runAsync('DELETE FROM journal_entries WHERE id=?',e.id);
  try { await FileSystem.deleteAsync(e.videoUri,{idempotent:true}); } catch {}
}
