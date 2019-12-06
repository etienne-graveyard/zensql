import { QUERIES } from './sql';
import { Pool } from 'pg';

const pool = new Pool();

async function doStuff() {
  await QUERIES.createClient(pool, { id: 456, name: '555' });
}

doStuff();
