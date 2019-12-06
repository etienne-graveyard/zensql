import { InsertIntoStatement, Node, Expression } from '@zensql/ast';
import { buildIdentifier, expressionFrom } from './utils';

export function InsertInto(
  table: string,
  columns: Array<string>,
  ...values: Array<Array<Expression | string | number | boolean>>
): InsertIntoStatement {
  return Node.create('InsertIntoStatement', {
    table: Node.create('Table', { schema: null, table: buildIdentifier(table) }),
    columns: columns.map(v => buildIdentifier(v)),
    values: values.map(vals =>
      Node.create('InserValues', { values: vals.map(v => expressionFrom(v)) })
    ),
  });
}
