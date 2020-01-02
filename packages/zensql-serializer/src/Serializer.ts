import {
  NodeInternal,
  Identifier,
  NodeType,
  BooleanOperator,
  CompareOperator,
  ValueOperator,
  Operators,
  Operator,
  DataTypeInternal,
  DataTypeUtils,
} from '@zensql/ast';

export const Serializer = {
  serialize: (node: NodeInternal | Array<NodeInternal>) => serializeInternal(node, null),
};

function formatOperator(
  sep: string,
  left: NodeInternal,
  right: NodeInternal,
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

const NODE_SERIALIZER: {
  [K in NodeType]: (node: NodeInternal<K>, parentPrecedence: number | null) => string;
} = {
  Bool: node => (node.value ? 'TRUE' : 'FALSE'),
  BooleanOperation: (node, parentPrecedence) => {
    const sep = node.operator === BooleanOperator.And ? 'AND' : 'OR';
    return formatOperator(sep, node.left, node.right, node.operator, parentPrecedence);
  },
  Case: () => {
    throw new Error('Unsuported');
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
  Empty: () => '',
  FromExpression: node => {
    return [
      `FROM ${serializeArray(node.tables)}`,
      node.where === null ? null : `WHERE ${serializeInternal(node.where, null)}`,
    ]
      .filter((v): v is string => v !== null)
      .join(' ');
  },
  Identifier: node => {
    if (node.caseSensitive) {
      // TODO: handle escaped
      return `"${node.value}"`;
    }
    return node.value;
  },
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
  Select: node => {
    return (
      [`SELECT ${serializeArray(node.columns)}`, serializeInternal(node.from, null)]
        .filter((v): v is string => v !== null)
        .join(' ') + ';'
    );
  },
  Str: node => {
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
  ReferenceTableConstraint: node =>
    `FOREIGN KEY (${serializeInternal(node.column, null)}) REFERENCES ${serializeCol(
      node.foreignKey.schema,
      node.foreignKey.table,
      null
    )} (${serializeInternal(node.foreignKey.column, null)})`,
  AlterTableStatement: node => {
    return `ALTER TABLE ${serializeInternal(node.table, null)} ${serializeInternal(
      node.item,
      null
    )};`;
  },
  AddContraint: node => {
    return `ADD ${
      node.name ? `CONSTRAINT ${serializeInternal(node.name, null)} ` : ``
    }${serializeInternal(node.constraint, null)}`;
  },
  DataType: node => {
    return serializeDataType(node.dt);
  },
  TsExternalType: () => ``,
  TsInlineType: () => ``,
};

function serializeInternal(
  node: NodeInternal | Array<NodeInternal>,
  parentPrecedence: number | null
): string {
  if (Array.isArray(node)) {
    return node.map(serializeInternal).join(`\n`);
  }
  const ser = NODE_SERIALIZER[node.type];
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

function serializeArray(expr: NodeInternal | Array<NodeInternal>, sep: string = ', '): string {
  if (Array.isArray(expr)) {
    return expr.map(serializeInternal).join(sep);
  }
  return serializeInternal(expr, null);
}

function serializeDataType(dt: DataTypeInternal): string {
  if (
    DataTypeUtils.is('BOOL', dt) ||
    DataTypeUtils.is('BOOLEAN', dt) ||
    DataTypeUtils.is('TEXT', dt) ||
    DataTypeUtils.is('INT', dt) ||
    DataTypeUtils.is('SMALLINT', dt) ||
    DataTypeUtils.is('INTEGER', dt) ||
    DataTypeUtils.is('SERIAL', dt) ||
    DataTypeUtils.is('DATE', dt) ||
    DataTypeUtils.is('UUID', dt) ||
    DataTypeUtils.is('REAL', dt) ||
    DataTypeUtils.is('JSON', dt) ||
    DataTypeUtils.is('JSONB', dt)
  ) {
    return dt.type;
  }
  if (
    DataTypeUtils.is('CHAR', dt) ||
    DataTypeUtils.is('CHARACTER', dt) ||
    DataTypeUtils.is('VARCHAR', dt) ||
    DataTypeUtils.is('TIME', dt) ||
    DataTypeUtils.is('TIMESTAMP', dt) ||
    DataTypeUtils.is('TIMESTAMPTZ', dt) ||
    DataTypeUtils.is('INTERVAL', dt)
  ) {
    return `${dt.type}${dt.param === null ? '' : `(${dt.param})`}`;
  }
  if (DataTypeUtils.is('NUMERIC', dt) || DataTypeUtils.is('DECIMAL', dt)) {
    return `${dt.type}${dt.params === null ? '' : `(${dt.params.p},${dt.params.s})`}`;
  }
  throw new Error(`Unsuported serialize on DataType of type ${(dt as any).type}`);
}
