import {
  Node,
  Identifier,
  NodeType,
  BooleanOperator,
  CompareOperator,
  ValueOperator,
  Operators,
  Operator,
} from '@zensql/ast';

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
  const content = `${serializeInternal(left, precedence)} ${sep} ${serializeInternal(
    right,
    precedence
  )}`;
  const parenthese = parentPrecedence !== null && parentPrecedence > precedence;
  return parenthese ? `(${content})` : content;
}

const SERIALIZER: {
  [K in NodeType]: (node: Node<K>, parentPrecedence: number | null) => string;
} = {
  Boolean: node => (node.value ? 'TRUE' : 'FALSE'),
  BooleanOperation: (node, parentPrecedence) => {
    const sep = node.operator === BooleanOperator.And ? 'AND' : 'OR';
    return formatOperator(sep, node.left, node.right, node.operator, parentPrecedence);
  },
  Case: () => {
    throw new Error('Unsuported');
  },
  CaseSensitiveIdentifier: node => {
    return `"${node.value}"`;
  },
  CaseWhen: () => {
    throw new Error('Unsuported');
  },
  Column: node => {
    return serializeCol(node.schema, node.table, node.column);
  },
  ColumnAlias: node => {
    return `${serializeCol(node.schema, node.table, node.column)} AS ${serializeInternal(
      node.alias,
      null
    )}`;
  },
  ColumnAll: () => '*',
  ColumnAllFromTable: node => {
    return `${serializeCol(node.schema, node.table, null)}.*`;
  },
  ColumnDef: node => {
    return [
      serializeInternal(node.name, null),
      serializeInternal(node.dataType, null),
      ...node.constraints.map(constraint => serializeInternal(constraint, null)),
    ].join(' ');
  },
  Comment: () => {
    return '';
  },
  CompareOperation: (node, parentPrecedence) => {
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
  },
  CreateTableStatement: node => {
    return `CREATE TABLE ${serializeInternal(node.table, null)} (${serializeArray(
      node.items,
      ', '
    )});`;
  },
  DataTypeIntParams: node => {
    return node.dt + (node.param !== null ? `(${node.param})` : '');
  },
  DataTypeNoParams: node => {
    return node.dt;
  },
  DataTypeNumeric: node => {
    return node.dt + (node.params !== null ? `(${node.params.p}, ${node.params.s})` : '');
  },
  Empty: () => '',
  FromExpression: node => {
    return [
      `FROM ${serializeArray(node.tables)}`,
      node.where === null ? null : `WHERE ${serializeInternal(node.where, null)}`,
    ]
      .filter((v): v is string => v !== null)
      .join(' ');
  },
  Identifier: node => node.value,
  IndexedVariable: node => {
    return '$' + node.num;
  },
  LeftJoin: node => {
    return `${serializeInternal(node.left, null)} LEFT JOIN ${serializeInternal(
      node.right,
      null
    )} ON ${serializeInternal(node.condition, null)}`;
  },
  NamedVariable: node => {
    return ':' + node.name;
  },
  Null: () => {
    return `NULL`;
  },
  Numeric: node => {
    return node.value.toString();
  },
  SelectStatement: node => {
    return (
      [`SELECT ${serializeArray(node.select)}`, serializeInternal(node.from, null)]
        .filter((v): v is string => v !== null)
        .join(' ') + ';'
    );
  },
  String: node => {
    // TODO: handle escape !!
    return `"${node.value}"`;
  },
  Table: node => {
    return serializeCol(node.schema, node.table, null);
  },
  TableAlias: node => {
    return `${serializeInternal(node.table, null)} AS ${serializeInternal(node.alias, null)}`;
  },
  ValueOperation: (node, parentPrecedence) => {
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
  },
  When: () => {
    throw new Error('Unsuported');
  },
  NotNullConstraint: () => {
    return 'NOT NULL';
  },
  PrimaryKeyConstraint: () => `PRIMARY KEY`,
  UniqueConstraint: () => `UNIQUE`,
  ReferenceConstraint: node =>
    `REFERENCES ${serializeCol(
      node.foreignKey.schema,
      node.foreignKey.table,
      null
    )} (${serializeInternal(node.foreignKey.column, null)})`,
  InsertIntoStatement: node =>
    [
      `INSERT INTO `,
      serializeInternal(node.table, null),
      node.columns ? ` (${serializeArray(node.columns)})` : '',
      ` VALUES `,
      serializeArray(node.values),
      `;`,
    ].join(''),
  InserValues: node => `(${serializeArray(node.values)})`,
  PrimaryKeyTableConstraint: node => `PRIMARY KEY (${serializeArray(node.columns)})`,
  AlterTableStatement: () => {
    throw new Error('Not implemented');
  },
};

function serializeInternal(node: Node | Array<Node>, parentPrecedence: number | null): string {
  if (Array.isArray(node)) {
    return node.map(serializeInternal).join(`\n`);
  }
  const ser = SERIALIZER[node.type];
  if (ser) {
    return ser(node as any, parentPrecedence);
  }
  throw new Error(`Unsuported serialize on Node of type ${node.type}`);
}

function serializeCol(
  schema: null | Identifier,
  table: null | Identifier,
  column: null | Identifier
): string {
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
