import { Pool, PoolConfig } from 'pg';

function buildPoolConfig(): PoolConfig {
  const dbHost = process.env.DB_HOST || 'localhost';
  const isCloudSql = dbHost.startsWith('/cloudsql/');

  const baseConfig: PoolConfig = {
    user: process.env.DB_USER || 'lingxi',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lingxi',
    max: parseInt(process.env.DB_POOL_MAX || '5', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  if (isCloudSql) {
    baseConfig.host = dbHost;
  } else {
    baseConfig.host = dbHost;
    baseConfig.port = parseInt(process.env.DB_PORT || '5432', 10);
  }

  return baseConfig;
}

const pool = new Pool(buildPoolConfig());

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle database client:', err.message);
});

pool.on('connect', () => {
  console.log('Database pool: new client connected');
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
  }
  return result;
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export async function healthCheck(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export default pool;
