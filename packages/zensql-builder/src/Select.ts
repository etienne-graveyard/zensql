import {
  Select,
  Node,
  SelectColumnsItem,
  TableExpression,
  Expression,
  LeftJoin,
  ColumnAll,
  ColumnAllFromTable,
  SelectColumns,
  FromExpression,
  Variable,
} from '@zensql/ast';
import { buildIdentifier } from './utils';

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

export function ColumnAll(): ColumnAll {
  return Node.create('ColumnAll', {});
}

export function ColumnAllFromTable(table: string): ColumnAllFromTable {
  return Node.create('ColumnAllFromTable', { schema: null, table: buildIdentifier(table) });
}

export interface FromExpressionOptions {
  tables: Array<TableExpression> | TableExpression;
  where?: Expression | null;
  limit?: number | Variable | null;
}

export function FromExpression(options: FromExpressionOptions): FromExpression {
  const { tables, where = null, limit = null } = options;
  return Node.create('FromExpression', {
    tables: Array.isArray(tables) ? tables : [tables],
    where,
    limit: typeof limit === 'number' ? Node.create('Numeric', { value: limit }) : limit,
  });
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
