import { NodeIs, Node, Identifier } from './Node';
import { BooleanOperator, CompareOperator, ValueOperator, Operators, Operator } from './Operator';

export const Serializer = {
  serialize: (node: Node | Array<Node>) => serializeInternal(node, null),
};

function formatOperator(
  sep: string,
  left: Node,
  right: Node,
  operator: Operator,
  parentPrecedence: null | number
): string {
  const precedence = Operators.getPrecedence(operator);
  const content = `${serializeInternal(left, precedence)} ${sep} ${serializeInternal(right, precedence)}`;
  const parenthese = parentPrecedence !== null && parentPrecedence > precedence;
  return parenthese ? `(${content})` : content;
}

function serializeInternal(node: Node | Array<Node>, parentPrecedence: number | null): string {
  if (Array.isArray(node)) {
    return node.map(serializeInternal).join(`\n`);
  }
  if (NodeIs.Boolean(node)) {
    return node.value ? 'TRUE' : 'FALSE';
  }
  if (NodeIs.BooleanOperation(node)) {
    const sep = node.operator === BooleanOperator.And ? 'AND' : 'OR';
    return formatOperator(sep, node.left, node.right, node.operator, parentPrecedence);
  }
  if (NodeIs.Column(node)) {
    return serializeCol(node.schema, node.table, node.column);
  }
  if (NodeIs.ColumnAlias(node)) {
    return `${serializeCol(node.schema, node.table, node.column)} AS ${serializeInternal(node.alias, null)}`;
  }
  if (NodeIs.ColumnAll(node)) {
    return `*`;
  }
  if (NodeIs.ColumnAllFromTable(node)) {
    return `${serializeCol(node.schema, node.table, null)}.*`;
  }
  if (NodeIs.Comment(node)) {
    return '';
  }
  if (NodeIs.CompareOperation(node)) {
    const op = node.operator;
    const sep =
      op === CompareOperator.Equal
        ? '='
        : op === CompareOperator.NotEqual
        ? '!='
        : op === CompareOperator.LessOrEqual
        ? '<='
        : op === CompareOperator.GreaterOrEqual
        ? '>='
        : op === CompareOperator.Less
        ? '<'
        : op === CompareOperator.Greater
        ? '>'
        : null;
    if (sep === null) {
      throw new Error(`Invalid CompareOperator ${op}`);
    }
    return formatOperator(sep, node.left, node.right, node.operator, parentPrecedence);
  }
  if (NodeIs.Empty(node)) {
    return '';
  }
  if (NodeIs.Identifier(node)) {
    return node.value;
  }
  if (NodeIs.CaseSensitiveIdentifier(node)) {
    return `"${node.value}"`;
  }
  if (NodeIs.IndexedVariable(node)) {
    return '$' + node.num;
  }
  if (NodeIs.NamedVariable(node)) {
    return ':' + node.name;
  }
  if (NodeIs.Null(node)) {
    return `NULL`;
  }
  if (NodeIs.Numeric(node)) {
    return node.value.toString();
  }
  if (NodeIs.SelectStatement(node)) {
    return (
      [`SELECT ${serializeArray(node.select)}`, serializeInternal(node.from, null)]
        .filter((v): v is string => v !== null)
        .join(' ') + ';'
    );
  }
  if (NodeIs.FromExpression(node)) {
    return [
      `FROM ${serializeArray(node.tables)}`,
      node.where === null ? null : `WHERE ${serializeInternal(node.where, null)}`,
    ]
      .filter((v): v is string => v !== null)
      .join(' ');
  }
  if (NodeIs.String(node)) {
    // TODO: handle escape !!
    return `"${node.value}"`;
  }
  if (NodeIs.Table(node)) {
    return serializeCol(node.schema, node.table, null);
  }
  if (NodeIs.TableAlias(node)) {
    return `${serializeCol(node.schema, node.table, null)} AS ${serializeInternal(node.alias, null)}`;
  }
  if (NodeIs.ValueOperation(node)) {
    const op = node.operator;
    const sep =
      op === ValueOperator.Plus
        ? '+'
        : op === ValueOperator.Multiply
        ? '*'
        : op === ValueOperator.Minus
        ? '-'
        : op === ValueOperator.Divide
        ? '/'
        : op === ValueOperator.Modulo
        ? '%'
        : null;
    if (sep === null) {
      throw new Error(`Invalid ValueOperation ${op}`);
    }
    return formatOperator(sep, node.left, node.right, node.operator, parentPrecedence);
  }
  throw new Error(`Unsuported serialize on Node of type ${node.type}`);
}

function serializeCol(schema: null | Identifier, table: null | Identifier, column: null | Identifier): string {
  return [schema, table, column]
    .filter((v): v is Identifier => v !== null)
    .map(serializeInternal)
    .join('.');
}

function serializeArray(expr: Node | Array<Node>, sep: string = ', '): string {
  if (Array.isArray(expr)) {
    return expr.map(serializeInternal).join(sep);
  }
  return serializeInternal(expr, null);
}
