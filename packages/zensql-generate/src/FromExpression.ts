import { Node, FromExpressionTable, NodeIs, Identifier } from '@zensql/parser';
import { DatabaseSchema } from './DatabaseSchema';

export const FromExpression = {
  resolve: resolveFromExpression,
};

type Columns = Array<Node<'ColumnDef'>>;

export interface TableResolved {
  table: string;
  columns: Columns;
  alias: string | null;
}

function resolveFromExpression(schema: DatabaseSchema, expr: Node<'FromExpression'>): Array<TableResolved> {
  // Validate FROM and extract selected tables
  return expr.tables
    .map(fromExpre => resolveFromExpressionTable(schema, fromExpre))
    .reduce<Array<TableResolved>>((acc, val) => {
      acc.push(...val);
      return acc;
    }, []);
}

function resolveFromExpressionTable(schema: DatabaseSchema, table: FromExpressionTable): Array<TableResolved> {
  if (NodeIs.LeftJoin(table)) {
    return resolveLeftJoin(schema, table);
  }
  if (NodeIs.Table(table)) {
    return [findTable(schema, table.table, null)];
  }
  throw new Error(`Unhandled type ${table.type}`);
}

function resolveLeftJoin(schema: DatabaseSchema, join: Node<'LeftJoin'>): Array<TableResolved> {
  // TODO: validate condition
  const left = resolveFromExpressionTable(schema, join.left);
  const right = resolveFromExpressionTable(schema, join.right);
  return [...left, ...right];
}

function findTable(schema: DatabaseSchema, table: Identifier, alias: Identifier | null): TableResolved {
  const tableResolved = schema.find(t => t.table.table.value === table.value);
  if (tableResolved === undefined) {
    throw new Error(`Invalid table ${table.value}`);
  }
  return {
    table: table.value,
    columns: tableResolved.columns,
    alias: alias ? alias.value : null,
  };
}
