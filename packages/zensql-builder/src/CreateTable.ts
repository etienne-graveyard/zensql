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
  DataTypeInternal,
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
  type: DataType | DataTypeInternal,
  ...constraints: Array<Constraint>
): ColumnDef {
  const dataType: DataType = Node.is('DataType', type as any)
    ? (type as any)
    : Node.create('DataType', { dt: type as any, tsType: null });
  return Node.create('ColumnDef', {
    name: buildIdentifier(columnName),
    constraints,
    dataType,
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
