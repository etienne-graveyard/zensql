import { Node, TableExpression, NodeIs, Identifier } from '@zensql/parser';
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
    .map(fromExpre => resolveTableExpression(schema, fromExpre))
    .reduce<Array<TableResolved>>((acc, val) => {
      acc.push(...val);
      return acc;
    }, []);
}

function resolveTableExpression(schema: DatabaseSchema, table: TableExpression): Array<TableResolved> {
  if (NodeIs.LeftJoin(table)) {
    return resolveLeftJoin(schema, table);
  }
  if (NodeIs.Table(table)) {
    return [findTable(schema, table.table, null)];
  }
  if (NodeIs.TableAlias(table)) {
    return [findTable(schema, table.table.table, table.alias)];
  }
  throw new Error(`Unhandled type ${table.type}`);
}

function resolveLeftJoin(schema: DatabaseSchema, join: Node<'LeftJoin'>): Array<TableResolved> {
  // TODO: validate condition
  const left = resolveTableExpression(schema, join.left);
  const right = resolveTableExpression(schema, join.right);
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
