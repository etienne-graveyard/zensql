import fse from 'fs-extra';
import path from 'path';
import { Parser, NodeIs, Node } from '@zensql/parser';
import { TableResolved, FromExpression } from './FromExpression';
import { ColumnResolved, Column } from './Column';
import { Variable } from './Variable';
import { DatabaseDefinition } from './DatabaseSchema';
import { VariableResolved } from './Expression';

export const Query = {
  find: findQueries,
  parse: parseQuery,
  resolve: resolveQuery,
};

export interface QueryResolved {
  query: Node<'SelectStatement'>;
  tables: Array<TableResolved>;
  columns: Array<ColumnResolved>;
  variables: Array<VariableResolved>;
  name: string;
  path: string;
}

async function findQueries(sqlQueriesFolder: string): Promise<Array<string>> {
  const queries = await fse.readdir(sqlQueriesFolder);
  return queries
    .map(fileName => {
      if (fileName.startsWith('_')) {
        return null;
      }
      const fullPath = path.resolve(sqlQueriesFolder, fileName);
      return fullPath;
    })
    .filter(notNull);
}

function notNull<T>(val: T | null): val is T {
  return val !== null;
}

function parseQuery(queryPath: string): Node<'SelectStatement'> {
  const content = fse.readFileSync(queryPath, { encoding: 'utf8' });
  const parsed = Parser.parse(content);
  if (Array.isArray(parsed)) {
    throw new Error(`Error in ${queryPath}: There should be only 1 query per file (found ${parsed.length})`);
  }
  if (NodeIs.Empty(parsed)) {
    throw new Error(`${queryPath} has no query`);
  }
  if (!NodeIs.SelectStatement(parsed)) {
    throw new Error(`${queryPath} should contain a SELECT statement`);
  }
  return parsed;
}

function resolveQuery(schema: DatabaseDefinition, queryPath: string): QueryResolved {
  const query = Query.parse(queryPath);
  const tables = FromExpression.resolve(schema, query.from);
  const allColumns = Column.findAll(tables);
  const columns = Column.resolve(tables, allColumns, query.select);
  const variables = Variable.resolve(allColumns, query.from.where);
  const name = formatName(path.basename(queryPath));

  return {
    query,
    tables,
    columns,
    variables,
    name,
    path: queryPath,
  };
}

function formatName(fileName: string): string {
  return fileName.replace(/\.sql$/, '');
}
