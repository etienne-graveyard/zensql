import { QUERIES } from './sql';
import { Pool } from 'pg';

async function doStuff() {
  const pool = new Pool({
    connectionString: 'zensql-example',
  });

  await QUERIES.insertClient(pool, {
    id: 'a81d6aee-c4c0-4dea-a2e8-4241355c2165',
    name: 'paul',
    infos: { adresse: '', age: 42 },
  });
  const res = await QUERIES.getClientById(pool, 'a81d6aee-c4c0-4dea-a2e8-4241355c2165');
  console.log(res.rows);

  await pool.end();
}

doStuff();
