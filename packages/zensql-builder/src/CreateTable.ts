import { Node, TableConstraint, DataType } from '@zensql/ast';

export const CREATE_TABLE = {
  create,
  COLUMN: createColumn,
};

function create(
  tableName: string,
  items: Array<Node<'ColumnDef'> | TableConstraint>
): Node<'CreateTableStatement'> {
  return Node.create('CreateTableStatement', {
    table: Node.create('Table', {
      schema: null,
      table: Node.create('Identifier', { value: tableName }),
    }),
    items,
  });
}

function createColumn(columnName: string, type: DataType): Node<'ColumnDef'> {
  return Node.create('ColumnDef', {
    name: Node.create('Identifier', { value: columnName }),
    constraints: [],
    dataType: type,
  });
}
