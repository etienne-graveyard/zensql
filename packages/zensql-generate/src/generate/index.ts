import path from 'path';
import { DatabaseSchema } from './DatabaseSchema';
import { Query } from './Query';
import { Printer } from './Printer';
import { Config, GlobalOptions } from '../common/Config';

export interface GenerateOptions {
  source: string;
  target: string;
  importFrom?: string;
}

export async function resolveGenerateOptions(options: GlobalOptions) {
  const config = await Config.read(process.cwd());
  return {
    source: config.sqlFolder,
    target: config.generatedFile,
    importFrom: options.importFrom,
  };
}

export async function runGenerateCommand(options: GenerateOptions) {
  const { source, target, importFrom = '@zensql/parser' } = options;

  const SQL_TABLES_FOLDER = path.resolve(source, 'tables');
  const SQL_QUERIES_FOLDER = path.resolve(source, 'queries');
  const OUTPUT_QUERIES_FILE = path.resolve(target);

  const schema = await DatabaseSchema.parse(SQL_TABLES_FOLDER);
  const queries = (await Query.find(SQL_QUERIES_FOLDER)).map(queryPath => {
    return Query.resolve(schema, queryPath);
  });
  await Printer.print({
    targetPath: OUTPUT_QUERIES_FILE,
    schema,
    queries,
    importFrom,
  });
}
