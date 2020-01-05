import { Table, Expression, UpdateItem, UpdateStatement, Node, Identifier } from '@zensql/ast';
import { buildIdentifier, expressionFrom } from './utils';

export interface UpdateOptions {
  table: Table | string;
  items: Array<UpdateItem>;
  where?: Expression | null;
}

export function Update(options: UpdateOptions): UpdateStatement {
  const { table, items, where = null } = options;

  return Node.create('UpdateStatement', {
    table:
      typeof table === 'string'
        ? Node.create('Table', { schema: null, table: buildIdentifier(table) })
        : table,
    items,
    where,
  });
}

export function UpdateItem(
  column: string | Identifier,
  value: Expression | string | number | boolean
): UpdateItem {
  return Node.create('UpdateItem', {
    column: buildIdentifier(column),
    value: expressionFrom(value),
  });
}
