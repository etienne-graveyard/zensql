/* eslint-disable @typescript-eslint/no-empty-interface */
import { BooleanOperator, CompareOperator, ValueOperator } from './Operator';
import { DataTypeIntParamName, DataTypeNoParamsName, DataTypeNumericName } from './DataType';

const NODES_TYPES = [
  'AlterTableStatement',
  'Bool',
  'BooleanOperation',
  'Case',
  'CaseWhen',
  'Column',
  'ColumnAlias',
  'ColumnAll',
  'ColumnAllFromTable',
  'ColumnDef',
  'Comment',
  'CompareOperation',
  'CreateTableStatement',
  'DataTypeIntParams',
  'DataTypeNoParams',
  'DataTypeNumeric',
  'Empty',
  'FromExpression',
  'Identifier',
  'IndexedVariable',
  'InsertIntoStatement',
  'InserValues',
  'LeftJoin',
  'NamedVariable',
  'NotNullConstraint',
  'Null',
  'Numeric',
  'PrimaryKeyConstraint',
  'PrimaryKeyTableConstraint',
  'ReferenceConstraint',
  'Select',
  'Str',
  'Table',
  'TableAlias',
  'UniqueConstraint',
  'ValueOperation',
  'When',
] as const;

export type NodeType = typeof NODES_TYPES extends ReadonlyArray<infer T> ? T : never;

export const Node = {
  create: createNode,
};

function createNode<K extends keyof NodesData>(
  type: K,
  data: NodesData[K],
  cursor?: Cursor
): AllNodes[K] {
  const node: NodeInternal<K> = {
    type,
    ...data,
  } as any;
  if (cursor) {
    node.cursor = cursor;
  }
  return node;
}

export const NodeIs: {
  [K in NodeType]: (node: NodeInternal) => node is NodeInternal<K>;
} = NODES_TYPES.reduce<any>((acc, key) => {
  acc[key] = (node: NodeInternal) => node.type === key;
  return acc;
}, {});

export interface NodesDataInternal {
  // Basics
  Str: { value: string };
  Numeric: { value: number };
  Bool: { value: boolean };
  Null: {};
  Comment: { value: string };

  // Variables
  NamedVariable: { name: string };
  IndexedVariable: { num: number };

  // Identifier
  Identifier: {
    // the value as used by Postgres in lowercase
    value: string;
    originalValue: string;
    caseSensitive: boolean;
  };

  // Expression
  When: {
    condition: Expression;
    then: Term;
  };
  Case: {
    term: Term;
    cases: Array<When>;
    else: Expression | null;
  };
  CaseWhen: {
    cases: Array<When>;
    else: Expression | null;
  };
  BooleanOperation: {
    left: Expression;
    operator: BooleanOperator;
    right: Expression;
  };
  CompareOperation: {
    left: Expression;
    operator: CompareOperator;
    right: Expression;
  };
  ValueOperation: {
    left: Expression;
    operator: ValueOperator;
    right: Expression;
  };

  // Column
  Column: {
    schema: Identifier | null;
    table: Identifier | null;
    column: Identifier;
  };
  ColumnAlias: {
    schema: Identifier | null;
    table: Identifier | null;
    column: Identifier;
    alias: Identifier;
  };
  ColumnAll: {};
  ColumnAllFromTable: { schema: Identifier | null; table: Identifier };

  // Table
  Table: { schema: Identifier | null; table: Identifier };
  TableAlias: {
    table: Table;
    alias: Identifier;
  };

  // Join
  LeftJoin: {
    left: TableExpression;
    right: TableExpression;
    condition: Expression;
  };

  // From
  FromExpression: {
    tables: Array<TableExpression>;
    where: Expression | null;
  };

  // Constraints
  NotNullConstraint: {};
  PrimaryKeyConstraint: {};
  UniqueConstraint: {};
  ReferenceConstraint: {
    foreignKey: Column;
  };
  PrimaryKeyTableConstraint: {
    columns: Array<Identifier>;
  };

  // ColumnDef
  ColumnDef: {
    name: Identifier;
    dataType: DataType;
    constraints: Array<Constraint>;
  };

  // DataTypes
  DataTypeNoParams: {
    dt: DataTypeNoParamsName;
  };
  DataTypeIntParams: {
    dt: DataTypeIntParamName;
    param: null | number;
  };
  DataTypeNumeric: {
    dt: DataTypeNumericName;
    params: null | { p: number; s: number };
  };

  InserValues: {
    values: Array<Expression>;
  };

  // Statements
  Empty: {};
  Select: {
    columns: SelectColumns;
    from: FromExpression;
  };
  InsertIntoStatement: {
    table: Table | TableAlias;
    columns: Array<Identifier> | null;
    values: Array<InserValues>;
  };
  CreateTableStatement: {
    table: Table;
    items: Array<ColumnDef | TableConstraint>;
  };
  AlterTableStatement: {
    table: Table;
  };
}

export type NodesData = ValidateNodeData<NodesDataInternal>;

export type Cursor = {
  line: number;
  column: number;
};

export interface NodeCommon {
  cursor?: Cursor;
}

export type AllNodes = {
  [K in NodeType]: NodesData[K] & { type: K } & NodeCommon;
};

export type NodeInternal<K extends NodeType = NodeType> = AllNodes[K];

export type ValidateNodeData<T extends { [K in NodeType]: any }> = {
  [K in NodeType]: any;
} extends T
  ? T
  : { error: '' };

export type NodeAny = Node;

export interface AlterTableStatement extends NodeInternal<'AlterTableStatement'> {}
export interface Bool extends NodeInternal<'Bool'> {}
export interface BooleanOperation extends NodeInternal<'BooleanOperation'> {}
export interface Case extends NodeInternal<'Case'> {}
export interface CaseWhen extends NodeInternal<'CaseWhen'> {}
export interface Column extends NodeInternal<'Column'> {}
export interface ColumnAlias extends NodeInternal<'ColumnAlias'> {}
export interface ColumnAll extends NodeInternal<'ColumnAll'> {}
export interface ColumnAllFromTable extends NodeInternal<'ColumnAllFromTable'> {}
export interface ColumnDef extends NodeInternal<'ColumnDef'> {}
export interface Comment extends NodeInternal<'Comment'> {}
export interface CompareOperation extends NodeInternal<'CompareOperation'> {}
export interface CreateTableStatement extends NodeInternal<'CreateTableStatement'> {}
export interface DataTypeIntParams extends NodeInternal<'DataTypeIntParams'> {}
export interface DataTypeNoParams extends NodeInternal<'DataTypeNoParams'> {}
export interface DataTypeNumeric extends NodeInternal<'DataTypeNumeric'> {}
export interface Empty extends NodeInternal<'Empty'> {}
export interface FromExpression extends NodeInternal<'FromExpression'> {}
export interface Identifier extends NodeInternal<'Identifier'> {}
export interface IndexedVariable extends NodeInternal<'IndexedVariable'> {}
export interface InsertIntoStatement extends NodeInternal<'InsertIntoStatement'> {}
export interface InserValues extends NodeInternal<'InserValues'> {}
export interface LeftJoin extends NodeInternal<'LeftJoin'> {}
export interface NamedVariable extends NodeInternal<'NamedVariable'> {}
export interface NotNullConstraint extends NodeInternal<'NotNullConstraint'> {}
export interface Null extends NodeInternal<'Null'> {}
export interface Numeric extends NodeInternal<'Numeric'> {}
export interface PrimaryKeyConstraint extends NodeInternal<'PrimaryKeyConstraint'> {}
export interface PrimaryKeyTableConstraint extends NodeInternal<'PrimaryKeyTableConstraint'> {}
export interface ReferenceConstraint extends NodeInternal<'ReferenceConstraint'> {}
export interface Select extends NodeInternal<'Select'> {}
export interface Table extends NodeInternal<'Table'> {}
export interface TableAlias extends NodeInternal<'TableAlias'> {}
export interface UniqueConstraint extends NodeInternal<'UniqueConstraint'> {}
export interface ValueOperation extends NodeInternal<'ValueOperation'> {}
export interface Str extends NodeInternal<'Str'> {}
export interface When extends NodeInternal<'When'> {}

// Alias
export type Value = Identifier | Str | Numeric | Bool | Null;
export type Variable = NamedVariable | IndexedVariable;
export type Term = Value | Variable | Column;
export type BinaryOperation = BooleanOperation | CompareOperation | ValueOperation;
export type Expression = BinaryOperation | Term;
export type DataType = DataTypeNoParams | DataTypeNumeric | DataTypeIntParams;
export type TableExpression = TableAlias | Table | LeftJoin;
export type SelectColumnsItem = Column | ColumnAlias | ColumnAll | ColumnAllFromTable;
export type SelectColumns = Array<SelectColumnsItem>;
export type Constraint =
  | NotNullConstraint
  | PrimaryKeyConstraint
  | UniqueConstraint
  | ReferenceConstraint;
export type TableConstraint = PrimaryKeyTableConstraint;
export type Statement = Select | CreateTableStatement | InsertIntoStatement | AlterTableStatement;
export type Statements = Array<Statement>;
