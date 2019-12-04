import fse from 'fs-extra';
import path from 'path';
import { Parser, NodeIs, Node } from '@zensql/parser';
import { ColumnResolved, ColumnUtils } from '../common/ColumnUtils';
import { Variable } from './Variable';
import { TableUtils, Tables } from '../common/TableUtils';
import { VariableResolved } from '../common/ExpressionUtils';

export const Query = {
  find: findQueries,
  parse: parseQuery,
  resolve: resolveQuery,
};

export interface SelectQueryResolved {
  type: 'Select';
  query: Node<'SelectStatement'>;
  columns: Array<ColumnResolved>;
  variables: Array<VariableResolved>;
  name: string;
  path: string;
}

export interface InsertQueryResolved {
  type: 'Insert';
  query: Node<'InsertStatement'>;
  variables: Array<VariableResolved>;
  name: string;
  path: string;
}

export type QueryResolved = SelectQueryResolved | InsertQueryResolved;

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

function parseQuery(queryPath: string): Node<'SelectStatement' | 'InsertStatement'> {
  const content = fse.readFileSync(queryPath, { encoding: 'utf8' });
  const parsed = Parser.parse(content);
  if (Array.isArray(parsed)) {
    throw new Error(`Error in ${queryPath}: There should be only 1 query per file (found ${parsed.length})`);
  }
  if (NodeIs.Empty(parsed)) {
    throw new Error(`${queryPath} has no query`);
  }
  if (NodeIs.SelectStatement(parsed) || NodeIs.InsertStatement(parsed)) {
    return parsed;
  }
  throw new Error(`${queryPath} should contain a SELECT statement`);
}

function resolveQuery(schema: Tables, queryPath: string): QueryResolved {
  const query = parseQuery(queryPath);
  if (NodeIs.SelectStatement(query)) {
    return resolveSelectQuery(schema, queryPath, query);
  }
  if (NodeIs.InsertStatement(query)) {
    return resolveInsertQuery(schema, queryPath, query);
  }
  throw new Error(`Invalid query type ${query.type}`);
}

function resolveInsertQuery(schema: Tables, queryPath: string, query: Node<'InsertStatement'>): InsertQueryResolved {
  const name = formatName(path.basename(queryPath));
  const variables = Variable.resolve(schema, query);
  return {
    type: 'Insert',
    name,
    query,
    path: queryPath,
    variables: variables,
  };
}

function resolveSelectQuery(schema: Tables, queryPath: string, query: Node<'SelectStatement'>): SelectQueryResolved {
  const tables = TableUtils.resolveFromExpression(schema, query.from);
  const allColumns = ColumnUtils.findAll(tables);
  const columns = ColumnUtils.resolveSelectColumns(tables, allColumns, query.select);
  const variables = Variable.resolve(schema, query);
  const name = formatName(path.basename(queryPath));

  return {
    type: 'Select',
    query,
    columns,
    variables,
    name,
    path: queryPath,
  };
}

function formatName(fileName: string): string {
  return fileName.replace(/\.sql$/, '');
}
