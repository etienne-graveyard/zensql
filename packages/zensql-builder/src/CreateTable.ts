import {
  Node,
  TableConstraint,
  DataType,
  Constraint,
  ColumnDef,
  CreateTableStatement,
  NotNullConstraint,
  PrimaryKeyConstraint,
  UniqueConstraint,
  ReferenceConstraint,
  PrimaryKeyTableConstraint,
} from '@zensql/ast';
import { buildIdentifier } from './utils';

export function CreateTable(
  tableName: string,
  items: Array<ColumnDef | TableConstraint>
): CreateTableStatement {
  return Node.create('CreateTableStatement', {
    table: Node.create('Table', {
      schema: null,
      table: buildIdentifier(tableName),
    }),
    items,
  });
}

export function ColumnDef(
  columnName: string,
  type: DataType,
  ...constraints: Array<Constraint>
): ColumnDef {
  return Node.create('ColumnDef', {
    name: buildIdentifier(columnName),
    constraints,
    dataType: type,
  });
}

export const ColumnConstraint = {
  NotNull: (): NotNullConstraint => Node.create('NotNullConstraint', {}),
  PrimaryKey: (): PrimaryKeyConstraint => Node.create('PrimaryKeyConstraint', {}),
  Unique: (): UniqueConstraint => Node.create('UniqueConstraint', {}),
  References: (table: string, column: string): ReferenceConstraint =>
    Node.create('ReferenceConstraint', {
      foreignKey: Node.create('Column', {
        schema: null,
        table: buildIdentifier(table),
        column: buildIdentifier(column),
      }),
    }),
};

export const TableConstraints = {
  PrimaryKey: (...columns: Array<string>): PrimaryKeyTableConstraint =>
    Node.create('PrimaryKeyTableConstraint', {
      columns: columns.map(col => buildIdentifier(col)),
    }),
};
