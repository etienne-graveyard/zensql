import { QUERIES } from './sql';
import { Pool } from 'pg';

const pool = new Pool();

async function doStuff() {
  await QUERIES.getResource(pool, 'my-doc');
}

doStuff();
