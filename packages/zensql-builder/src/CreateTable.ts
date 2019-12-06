import {
  Node,
  TableConstraint,
  DataType,
  Constraint,
  ColumnDef,
  CreateTableStatement,
  Identifier,
  NotNullConstraint,
  PrimaryKeyConstraint,
  UniqueConstraint,
  ReferenceConstraint,
  PrimaryKeyTableConstraint,
} from '@zensql/ast';

export const CREATE_TABLE = {
  create: createTable,
  CONSTRAINT: createTableConstraints(),
  COLUMN: {
    create: createColumn,
    CONSTRAINT: createColumnConstraints(),
  },
};

function createIdentifier(val: string): Identifier {
  return Node.create('Identifier', {
    value: val.toLowerCase(),
    originalValue: val,
    caseSensitive: false,
  });
}

function createTable(
  tableName: string,
  items: Array<ColumnDef | TableConstraint>
): CreateTableStatement {
  return Node.create('CreateTableStatement', {
    table: Node.create('Table', {
      schema: null,
      table: createIdentifier(tableName),
    }),
    items,
  });
}

function createColumn(
  columnName: string,
  type: DataType,
  ...constraints: Array<Constraint>
): ColumnDef {
  return Node.create('ColumnDef', {
    name: createIdentifier(columnName),
    constraints,
    dataType: type,
  });
}

function createColumnConstraints() {
  return {
    NOT_NULL: (): NotNullConstraint => Node.create('NotNullConstraint', {}),
    PRIMARY_KEY: (): PrimaryKeyConstraint => Node.create('PrimaryKeyConstraint', {}),
    UNIQUE: (): UniqueConstraint => Node.create('UniqueConstraint', {}),
    REFERENCES: (table: string, column: string): ReferenceConstraint =>
      Node.create('ReferenceConstraint', {
        foreignKey: Node.create('Column', {
          schema: null,
          table: createIdentifier(table),
          column: createIdentifier(column),
        }),
      }),
  };
}

function createTableConstraints() {
  return {
    PRIMARY_KEY: (...columns: Array<string>): PrimaryKeyTableConstraint =>
      Node.create('PrimaryKeyTableConstraint', {
        columns: columns.map(col => createIdentifier(col)),
      }),
  };
}
