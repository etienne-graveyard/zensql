import path from 'path';
import { TableUtils } from '../common/TableUtils';
import { Query } from './Query';
import { Printer } from './Printer';
import { Config } from '../common/Config';

export interface GenerateOptions {
  sqlFolder: string;
  target: string;
}

export async function resolveGenerateOptions(): Promise<GenerateOptions> {
  const config = await Config.read(process.cwd());
  return {
    sqlFolder: config.sqlFolder,
    target: config.generatedFile,
  };
}

export async function runGenerateCommand(options: GenerateOptions) {
  const { sqlFolder, target } = options;

  const sqlFolders = Config.resolveSqlFolders(sqlFolder);

  const OUTPUT_QUERIES_FILE = path.resolve(target);

  const schema = await TableUtils.parse(sqlFolders.tables);
  const queries = (await Query.find(sqlFolders.queries)).map(queryPath => {
    return Query.resolve(schema, queryPath);
  });
  await Printer.print({
    targetPath: OUTPUT_QUERIES_FILE,
    queries,
  });
}
