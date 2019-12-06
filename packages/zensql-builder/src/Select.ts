import {
  Select,
  Node,
  SelectColumnsItem,
  TableExpression,
  Expression,
  Table,
  TableAlias,
  LeftJoin,
  ColumnAll,
  ColumnAllFromTable,
  SelectColumns,
  FromExpression,
} from '@zensql/ast';
import { buildIdentifier } from './utils';

export function ColumnAll(): ColumnAll {
  return Node.create('ColumnAll', {});
}

export function ColumnAllFromTable(table: string): ColumnAllFromTable {
  return Node.create('ColumnAllFromTable', { schema: null, table: buildIdentifier(table) });
}

export interface SelectOptions {
  columns: SelectColumnsItem | SelectColumns;
  from: FromExpression;
}

export function Select(options: SelectOptions): Select {
  const { columns, from } = options;

  return Node.create('Select', {
    columns: Array.isArray(columns) ? columns : [columns],
    from,
  });
}

export interface FromExpressionOptions {
  tables: Array<TableExpression> | TableExpression;
  where?: Expression | null;
}

export function FromExpression(options: FromExpressionOptions): FromExpression {
  const { tables, where = null } = options;
  return Node.create('FromExpression', {
    tables: Array.isArray(tables) ? tables : [tables],
    where,
  });
}

export function Table(table: string): Table;
export function Table(table: string, alias: string): TableAlias;
export function Table(table: string, alias?: string): Table | TableAlias {
  const tableNode = Node.create('Table', { schema: null, table: buildIdentifier(table) });
  if (alias === undefined) {
    return tableNode;
  }
  return Node.create('TableAlias', { table: tableNode, alias: buildIdentifier(alias) });
}

export interface LeftJoinOptions {
  left: TableExpression;
  right: TableExpression;
  condition: Expression;
}

export function LeftJoin(options: LeftJoinOptions): LeftJoin {
  return Node.create('LeftJoin', {
    ...options,
  });
}
