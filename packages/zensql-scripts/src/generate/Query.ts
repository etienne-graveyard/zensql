import { NodeIs, Select, InsertIntoStatement } from '@zensql/ast';
import { ColumnResolved, ColumnUtils } from '../common/ColumnUtils';
import { Variable } from './Variable';
import { TableUtils } from '../common/TableUtils';
import { VariableResolved } from '../common/ExpressionUtils';
import { Schema } from '../common/SchemaUtils';

export const Query = {
  resolve: resolveQuery,
};

export interface SelectQueryResolved {
  type: 'Select';
  query: Select;
  columns: Array<ColumnResolved>;
  variables: Array<VariableResolved>;
  name: string;
}

export interface InsertQueryResolved {
  type: 'Insert';
  query: InsertIntoStatement;
  variables: Array<VariableResolved>;
  name: string;
}

export type QueryResolved = SelectQueryResolved | InsertQueryResolved;

function resolveQuery(
  schema: Schema,
  name: string,
  query: Select | InsertIntoStatement
): QueryResolved {
  if (NodeIs.Select(query)) {
    return resolveSelectQuery(schema, name, query);
  }
  if (NodeIs.InsertIntoStatement(query)) {
    return resolveInsertQuery(schema, name, query);
  }
  throw new Error(`Invalid query type ${(query as any).type}`);
}

function resolveInsertQuery(
  schema: Schema,
  name: string,
  query: InsertIntoStatement
): InsertQueryResolved {
  const variables = Variable.resolve(schema, query);
  return {
    type: 'Insert',
    name,
    query,
    variables: variables,
  };
}

function resolveSelectQuery(schema: Schema, name: string, query: Select): SelectQueryResolved {
  const tables = TableUtils.resolveFromExpression(schema, query.from);
  const allColumns = ColumnUtils.findAll(tables);
  const columns = ColumnUtils.resolveSelectColumns(tables, allColumns, query.columns);
  const variables = Variable.resolve(schema, query);

  return {
    type: 'Select',
    query,
    columns,
    variables,
    name,
  };
}
