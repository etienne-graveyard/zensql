import { Pool } from 'pg';
import inquirer from 'inquirer';
import Serializer from '@zensql/serializer';
import { SchemaUtils, Schema } from '../common/SchemaUtils';

export interface SetupOptions {
  connectUrl?: string;
  schema: Schema;
}

interface TableWithCount {
  table: any;
  count: number;
  name: string;
}

export async function setup(options: SetupOptions) {
  const { connectUrl, schema } = options;

  const connectUrlResolved = connectUrl === undefined ? await getConnectUrl() : connectUrl;

  console.log({ connectUrl: connectUrlResolved });

  const pool = new Pool({
    connectionString: connectUrlResolved,
  });

  // Test connection
  await pool.query(`SELECT now()`);

  const tableDropNoError = await dropAllTables(pool);

  if (tableDropNoError === false) {
    await pool.end();
    return;
  }

  const tablesResolved = SchemaUtils.resolve(schema);

  const answer = await inquirer.prompt([
    {
      name: 'confirmCreate',
      type: 'confirm',
      message: [
        `The followin tables will be created:`,
        tablesResolved.tables.map(tab => `  - ${tab.table.table.value}`).join('\n'),
        ``,
      ].join('\n'),
    },
  ]);
  if (answer.confirmCreate !== true) {
    await pool.end();
    return;
  }

  const allCreateStatements = tablesResolved.tables.map(v => Serializer.serialize(v)).join('\n\n');
  console.info(`Creating tables`);
  await pool.query(allCreateStatements);
  const allConstraintStatements = tablesResolved.constraints
    .map(v => Serializer.serialize(v))
    .join('\n\n');
  console.info(`Creating constraints`);
  await pool.query(allConstraintStatements);

  await pool.end();
}

async function getConnectUrl(): Promise<string> {
  const answer = await inquirer.prompt([
    {
      name: 'url',
      message: `Enter Postgres connect URL`,
    },
  ]);
  return answer.url;
}

async function dropAllTables(pool: Pool): Promise<boolean> {
  const prevTables = await pool.query(
    `SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
  );
  const prevTablesWithCounts: Array<TableWithCount> = await prevTables.rows.reduce<
    Promise<Array<TableWithCount>>
  >(async (acc, table) => {
    const obj = await acc;
    const count = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
    obj.push({
      table,
      name: table.table_name,
      count: parseInt(count.rows[0].count, 10),
    });
    return obj;
  }, Promise.resolve([]));

  if (prevTablesWithCounts.length === 0) {
    return true;
  }

  const answer = await inquirer.prompt([
    {
      name: 'confirmDelete',
      type: 'confirm',
      message: [
        `The followin tables will be removed:`,
        prevTablesWithCounts.map(tab => `  - ${tab.name} (${tab.count})`).join('\n'),
        ``,
      ].join('\n'),
    },
  ]);

  if (answer.confirmDelete !== true) {
    return false;
  }

  await prevTablesWithCounts.reduce<Promise<void>>(async (acc, item) => {
    await acc;
    console.info(`Deleting ${item.name}`);
    await pool.query(`DROP TABLE IF EXISTS ${item.name} CASCADE`);
  }, Promise.resolve());

  return true;
}
