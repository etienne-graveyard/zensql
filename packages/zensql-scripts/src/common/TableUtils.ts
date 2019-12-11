import {
  TableExpression,
  Identifier,
  TableConstraint,
  ColumnDef,
  FromExpression,
  LeftJoin,
  NodeInternal,
  Table,
  TableAlias,
  Node,
} from '@zensql/ast';
import { Schema } from './SchemaUtils';

export const TableUtils = {
  resolveFromExpression,
  resolveTable,
};

type Columns = Array<ColumnDef>;

export interface TableResolved {
  table: string;
  columns: Columns;
  constraints: Array<TableConstraint>;
  alias: string | null;
}

function resolveFromExpression(schema: Schema, expr: FromExpression): Array<TableResolved> {
  // Validate FROM and extract selected tables
  return expr.tables
    .map(fromExpre => resolveTableExpression(schema, fromExpre))
    .reduce<Array<TableResolved>>((acc, val) => {
      acc.push(...val);
      return acc;
    }, []);
}

function resolveTableExpression(schema: Schema, table: TableExpression): Array<TableResolved> {
  if (Node.is('LeftJoin', table)) {
    return resolveLeftJoin(schema, table);
  }
  if (Node.is('Table', table)) {
    return [findTable(schema, table.table, null)];
  }
  if (Node.is('TableAlias', table)) {
    return [findTable(schema, table.table.table, table.alias)];
  }
  throw new Error(`Unhandled type ${(table as any).type}`);
}

function resolveLeftJoin(schema: Schema, join: LeftJoin): Array<TableResolved> {
  // TODO: validate condition
  const left = resolveTableExpression(schema, join.left);
  const right = resolveTableExpression(schema, join.right);
  return [...left, ...right];
}

function findTable(schema: Schema, table: Identifier, alias: Identifier | null): TableResolved {
  const tableResolved = schema.find(t => t.table.table.value === table.value);
  if (tableResolved === undefined) {
    throw new Error(`Invalid table ${table.value}`);
  }
  return {
    table: table.value,
    columns: tableResolved.items.filter((n): n is ColumnDef => Node.is('ColumnDef', n)),
    constraints: tableResolved.items.filter(NodeTableConstraint),
    alias: alias ? alias.value : null,
  };
}

function NodeTableConstraint(node: NodeInternal): node is TableConstraint {
  return Node.is('PrimaryKeyTableConstraint', node);
}

function resolveTable(schema: Schema, table: Table | TableAlias): TableResolved {
  if (Node.is('Table', table)) {
    return findTable(schema, table.table, null);
  }
  if (Node.is('TableAlias', table)) {
    return findTable(schema, table.table.table, table.alias);
  }
  throw new Error(`Unexpect code path`);
}
