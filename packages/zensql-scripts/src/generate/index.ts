import path from 'path';
import { Tables } from '../common/Tables';
import { Query } from './Query';
import { Printer } from './Printer';
import { Config, GlobalOptions } from '../common/Config';

export interface GenerateOptions {
  sqlFolder: string;
  target: string;
  importFrom?: string;
}

export async function resolveGenerateOptions(options: GlobalOptions): Promise<GenerateOptions> {
  const config = await Config.read(process.cwd());
  return {
    sqlFolder: config.sqlFolder,
    target: config.generatedFile,
    importFrom: options.importFrom,
  };
}

export async function runGenerateCommand(options: GenerateOptions) {
  const { sqlFolder, target, importFrom = '@zensql/parser' } = options;

  const sqlFolders = Config.resolveSqlFolders(sqlFolder);

  const OUTPUT_QUERIES_FILE = path.resolve(target);

  const schema = await Tables.parse(sqlFolders.tables);
  const queries = (await Query.find(sqlFolders.queries)).map(queryPath => {
    return Query.resolve(schema, queryPath);
  });
  await Printer.print({
    targetPath: OUTPUT_QUERIES_FILE,
    schema,
    queries,
    importFrom,
  });
}
