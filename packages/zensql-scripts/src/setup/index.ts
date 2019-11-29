import { Pool } from 'pg';
import inquirer from 'inquirer';
import { Tables } from '../common/Tables';
import { Config } from '../common/Config';
import { Serializer } from '@zensql/parser';

export interface SetupOptions {
  connectUrl: string;
  sqlFolder: string;
}

interface TableWithCount {
  table: any;
  count: number;
  name: string;
}

export async function resolveSetupOptions(argv: Array<string>): Promise<SetupOptions> {
  const connectUrl = argv[0];
  if (connectUrl === undefined) {
    throw new Error(`setup command require a connectUrl option`);
  }
  const config = await Config.read(process.cwd());
  return { connectUrl, sqlFolder: config.sqlFolder };
}

export async function runSetupCommand(options: SetupOptions) {
  const { connectUrl, sqlFolder } = options;
  const sqlFolders = Config.resolveSqlFolders(sqlFolder);

  const pool = new Pool({
    connectionString: connectUrl,
  });
  // testing the connection
  await pool.query('SELECT NOW()');
  //
  const prevTables = await pool.query(
    `SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
  );
  const prevTablesWithCounts: Array<TableWithCount> = await prevTables.rows.reduce<Promise<Array<TableWithCount>>>(
    async (acc, table) => {
      const obj = await acc;
      const count = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      obj.push({
        table,
        name: table.table_name,
        count: parseInt(count.rows[0].count, 10),
      });
      return obj;
    },
    Promise.resolve([])
  );

  if (prevTablesWithCounts.length > 0) {
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
      return;
    }
    await prevTablesWithCounts.reduce<Promise<void>>(async (acc, item) => {
      await acc;
      console.log(`Deleting ${item.name}`);
      await pool.query(`DROP TABLE ${item.name}`);
    }, Promise.resolve());
  }

  const tables = await Tables.parse(sqlFolders.tables);
  console.log(tables);

  const answer = await inquirer.prompt([
    {
      name: 'confirmCreate',
      type: 'confirm',
      message: [`The followin tables will be created:`, tables.map(tab => `  - ${tab.name}`).join('\n'), ``].join('\n'),
    },
  ]);
  if (answer.confirmCreate !== true) {
    return;
  }
  await tables.reduce<Promise<void>>(async (acc, item) => {
    await acc;
    console.log(`Creating ${item.name}`);
    await pool.query(Serializer.serialize(item.ast));
  }, Promise.resolve());
}
