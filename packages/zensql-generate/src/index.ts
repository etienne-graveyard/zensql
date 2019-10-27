import path from 'path';
import { DatabaseSchema } from './DatabaseSchema';
import { Query } from './Query';
import { Printer } from './Printer';

interface Options {
  source: string;
  target: string;
}

export async function command(argv: Array<string>) {
  const source = path.resolve(process.cwd(), argv[2]);
  const target = path.resolve(process.cwd(), argv[3]);

  try {
    await runCommand({ source, target });
  } catch (error) {
    console.log('Something bad happened');
    console.error(error);
  }
}

export async function runCommand(options: Options) {
  const { source, target } = options;

  const SQL_TABLES_FOLDER = path.resolve(source, 'tables');
  const SQL_QUERIES_FOLDER = path.resolve(source, 'queries');
  const OUTPUT_QUERIES_FILE = path.resolve(target);

  const schema = await DatabaseSchema.parse(SQL_TABLES_FOLDER);
  const queries = (await Query.find(SQL_QUERIES_FOLDER)).map(queryPath => {
    return Query.resolve(schema, queryPath);
  });
  await Printer.print(OUTPUT_QUERIES_FILE, schema, queries);
}
