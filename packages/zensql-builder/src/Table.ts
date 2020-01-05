import { Table, TableAlias, Node } from '@zensql/ast';
import { buildIdentifier } from './utils';

export function Table(table: string): Table;
export function Table(table: string, alias: string): TableAlias;
export function Table(table: string, alias?: string): Table | TableAlias {
  const tableNode = Node.create('Table', { schema: null, table: buildIdentifier(table) });
  if (alias === undefined) {
    return tableNode;
  }
  return Node.create('TableAlias', { table: tableNode, alias: buildIdentifier(alias) });
}
