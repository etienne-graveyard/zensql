import { Node, Parser, NodeIs } from '@zensql/parser';
import fse from 'fs-extra';
import path from 'path';

export interface Table {
  name: string;
  ast: Node<'CreateTableStatement'>;
}

export type Tables = Array<Table>;

export const Tables = {
  parse: parseTables,
};

async function parseTables(sqlTablesFolder: string): Promise<Tables> {
  const tablesFiles = await fse.readdir(sqlTablesFolder);
  const tables = tablesFiles.map(fileName => {
    const fullPath = path.resolve(sqlTablesFolder, fileName);
    const content = fse.readFileSync(fullPath, { encoding: 'utf8' });
    return parseTable(fileName, content);
  });

  return tables;
}

function parseTable(fileName: string, query: string): Table {
  const parsed = Parser.parse(query);
  if (Array.isArray(parsed)) {
    throw new Error(`Error in ${fileName}: There should be only 1 statement per file (found ${parsed.length})`);
  }
  if (NodeIs.Empty(parsed)) {
    throw new Error(`${fileName} has no statement`);
  }
  if (!NodeIs.CreateTableStatement(parsed)) {
    throw new Error(`${fileName} should contain a CREATE statement`);
  }
  const schema = parsed.table.schema ? parsed.table.schema.value : 'public';
  if (schema !== 'public') {
    throw new Error('Schema other than public are not supported yet');
  }
  const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
  const tableName = parsed.table.table.value;
  if (tableName !== fileNameWithoutExt) {
    throw new Error(`Table files should have the same name as the table it define ${tableName} in ${fileName}`);
  }
  return {
    name: tableName,
    ast: parsed,
  };
}
