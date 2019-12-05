import fse from 'fs-extra';
import path from 'path';
import { Parser } from '@zensql/parser';
import { Node, NodeIs, TableExpression, Identifier, TableConstraint } from '@zensql/ast';

export interface Table {
  name: string;
  ast: Node<'CreateTableStatement'>;
}

export type Tables = Array<Table>;

export const TableUtils = {
  parse: parseTables,
  resolveFromExpression,
  resolveTable,
};

async function parseTables(sqlTablesFolder: string): Promise<Tables> {
  const tablesFiles = await fse.readdir(sqlTablesFolder);
  const tables = tablesFiles.map(fileName => {
    const fullPath = path.resolve(sqlTablesFolder, fileName);
    const content = fse.readFileSync(fullPath, { encoding: 'utf8' });
    try {
      return parseTable(fileName, content);
    } catch (error) {
      console.error(`Error while parsing ${fileName}`);
      throw error;
    }
  });

  return tables;
}

function parseTable(fileName: string, query: string): Table {
  const parsed = Parser.parse(query);
  if (Array.isArray(parsed)) {
    throw new Error(
      `Error in ${fileName}: There should be only 1 statement per file (found ${parsed.length})`
    );
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
    throw new Error(
      `Table files should have the same name as the table it define ${tableName} in ${fileName}`
    );
  }
  return {
    name: tableName,
    ast: parsed,
  };
}

type Columns = Array<Node<'ColumnDef'>>;

export interface TableResolved {
  table: string;
  columns: Columns;
  constraints: Array<TableConstraint>;
  alias: string | null;
}

function resolveFromExpression(tables: Tables, expr: Node<'FromExpression'>): Array<TableResolved> {
  // Validate FROM and extract selected tables
  return expr.tables
    .map(fromExpre => resolveTableExpression(tables, fromExpre))
    .reduce<Array<TableResolved>>((acc, val) => {
      acc.push(...val);
      return acc;
    }, []);
}

function resolveTableExpression(schema: Tables, table: TableExpression): Array<TableResolved> {
  if (NodeIs.LeftJoin(table)) {
    return resolveLeftJoin(schema, table);
  }
  if (NodeIs.Table(table)) {
    return [findTable(schema, table.table, null)];
  }
  if (NodeIs.TableAlias(table)) {
    return [findTable(schema, table.table.table, table.alias)];
  }
  throw new Error(`Unhandled type ${(table as any).type}`);
}

function resolveLeftJoin(tables: Tables, join: Node<'LeftJoin'>): Array<TableResolved> {
  // TODO: validate condition
  const left = resolveTableExpression(tables, join.left);
  const right = resolveTableExpression(tables, join.right);
  return [...left, ...right];
}

function findTable(tables: Tables, table: Identifier, alias: Identifier | null): TableResolved {
  const tableResolved = tables.find(t => t.ast.table.table.value === table.value);
  if (tableResolved === undefined) {
    throw new Error(`Invalid table ${table.value}`);
  }
  return {
    table: table.value,
    columns: tableResolved.ast.items.filter(NodeIs.ColumnDef),
    constraints: tableResolved.ast.items.filter(NodeIsTableConstraint),
    alias: alias ? alias.value : null,
  };
}

function NodeIsTableConstraint(node: Node): node is TableConstraint {
  return NodeIs.PrimaryKeyTableConstraint(node);
}

function resolveTable(tables: Tables, table: Node<'Table' | 'TableAlias'>): TableResolved {
  if (NodeIs.Table(table)) {
    return findTable(tables, table.table, null);
  }
  if (NodeIs.TableAlias(table)) {
    return findTable(tables, table.table.table, table.alias);
  }
  throw new Error(`Unexpect code path`);
}
