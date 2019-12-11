import {
  AlterTableStatement,
  Node,
  AlterTableItem,
  AddContraint,
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

export function AddContraint(
  constraint: TableConstraint,
  name?: string | Identifier
): AddContraint {
  return Node.create('AddContraint', {
    constraint,
    name: name === undefined ? null : buildIdentifier(name),
  });
}
