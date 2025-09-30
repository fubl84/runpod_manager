import sqlite3 from 'sqlite3';
import { app } from 'electron';
import { join } from 'path';
import { PodProfile, Command } from '../shared/types';

export class DatabaseService {
  private db: sqlite3.Database;
  private dbReady: Promise<void>;

  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = join(userDataPath, 'runpod-manager.db');

    this.db = new sqlite3.Database(dbPath);
    this.dbReady = this.initTables();
  }

  private async initTables(): Promise<void> {
    const runAsync = (sql: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    };

    // Create pods table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS pods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        ip TEXT NOT NULL,
        port INTEGER NOT NULL,
        local_port INTEGER NOT NULL,
        ssh_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create commands table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS commands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        command TEXT NOT NULL,
        assigned_pod_id TEXT,
        category TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_pod_id) REFERENCES pods(id) ON DELETE SET NULL
      )
    `);

    // Create indexes for better performance
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_pods_name ON pods(name)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_commands_name ON commands(name)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_commands_category ON commands(category)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_commands_assigned_pod ON commands(assigned_pod_id)`);
  }

  // Pod operations
  async getAllPods(): Promise<PodProfile[]> {
    await this.dbReady;

    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT
          id, name, description, ip, port, local_port as localPort,
          ssh_url as sshUrl, created_at as createdAt, updated_at as updatedAt
        FROM pods
        ORDER BY updated_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as PodProfile[]);
      });
    });
  }

  async getPodById(id: string): Promise<PodProfile | null> {
    await this.dbReady;

    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT
          id, name, description, ip, port, local_port as localPort,
          ssh_url as sshUrl, created_at as createdAt, updated_at as updatedAt
        FROM pods
        WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row ? (row as PodProfile) : null);
      });
    });
  }

  async createPod(pod: Omit<PodProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PodProfile> {
    await this.dbReady;

    const id = `pod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO pods (id, name, description, ip, port, local_port, ssh_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, pod.name, pod.description, pod.ip, pod.port, pod.localPort, pod.sshUrl, now, now], (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    const created = await this.getPodById(id);
    if (!created) throw new Error('Failed to create pod');
    return created;
  }

  async updatePod(id: string, updates: Partial<Omit<PodProfile, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PodProfile | null> {
    await this.dbReady;
    const existing = await this.getPodById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'localPort') {
        fields.push('local_port = ?');
      } else if (key === 'sshUrl') {
        fields.push('ssh_url = ?');
      } else {
        fields.push(`${key} = ?`);
      }
      values.push(value);
    });

    fields.push('updated_at = ?');
    values.push(now, id);

    await new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE pods
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    return this.getPodById(id);
  }

  async deletePod(id: string): Promise<boolean> {
    await this.dbReady;

    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM pods WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  // Command operations
  async getAllCommands(): Promise<Command[]> {
    await this.dbReady;

    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT
          id, name, command, assigned_pod_id as assignedPodId,
          category, description, created_at as createdAt, updated_at as updatedAt
        FROM commands
        ORDER BY updated_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Command[]);
      });
    });
  }

  async getCommandById(id: string): Promise<Command | null> {
    await this.dbReady;

    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT
          id, name, command, assigned_pod_id as assignedPodId,
          category, description, created_at as createdAt, updated_at as updatedAt
        FROM commands
        WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row ? (row as Command) : null);
      });
    });
  }

  async getCommandsByPod(podId: string): Promise<Command[]> {
    await this.dbReady;

    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT
          id, name, command, assigned_pod_id as assignedPodId,
          category, description, created_at as createdAt, updated_at as updatedAt
        FROM commands
        WHERE assigned_pod_id = ? OR assigned_pod_id IS NULL
        ORDER BY name
      `, [podId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Command[]);
      });
    });
  }

  async searchCommands(query: string): Promise<Command[]> {
    await this.dbReady;

    const searchTerm = `%${query}%`;
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT
          id, name, command, assigned_pod_id as assignedPodId,
          category, description, created_at as createdAt, updated_at as updatedAt
        FROM commands
        WHERE name LIKE ? OR command LIKE ? OR description LIKE ?
        ORDER BY name
      `, [searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Command[]);
      });
    });
  }

  async createCommand(command: Omit<Command, 'id' | 'createdAt' | 'updatedAt'>): Promise<Command> {
    await this.dbReady;

    const id = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO commands (id, name, command, assigned_pod_id, category, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        command.name,
        command.command,
        command.assignedPodId || null,
        command.category || null,
        command.description || null,
        now,
        now
      ], (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    const created = await this.getCommandById(id);
    if (!created) throw new Error('Failed to create command');
    return created;
  }

  async updateCommand(id: string, updates: Partial<Omit<Command, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Command | null> {
    await this.dbReady;
    const existing = await this.getCommandById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'assignedPodId') {
        fields.push('assigned_pod_id = ?');
      } else {
        fields.push(`${key} = ?`);
      }
      values.push(value);
    });

    fields.push('updated_at = ?');
    values.push(now, id);

    await new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE commands
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    return this.getCommandById(id);
  }

  async deleteCommand(id: string): Promise<boolean> {
    await this.dbReady;

    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM commands WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  close(): void {
    this.db.close();
  }
}