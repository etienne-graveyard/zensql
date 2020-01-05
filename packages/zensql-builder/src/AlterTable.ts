import {
  AlterTableStatement,
  Node,
  AlterTableItem,
  AddConstraint,
  TableConstraint,
  Identifier,
} from '@zensql/ast';
import { buildIdentifier } from './utils';

export function AlterTable(table: string | Identifier, item: AlterTableItem): AlterTableStatement {
  return Node.create('AlterTableStatement', {
    table: Node.create('Table', {
      schema: null,
      table: buildIdentifier(table),
    }),
    item,
  });
}

export function AddConstraint(
  constraint: TableConstraint,
  name?: string | Identifier
): AddConstraint {
  return Node.create('AddConstraint', {
    constraint,
    name: name === undefined ? null : buildIdentifier(name),
  });
}
