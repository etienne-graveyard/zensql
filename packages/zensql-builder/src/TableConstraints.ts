import {
  Node,
  PrimaryKeyTableConstraint,
  ReferenceTableConstraint,
  Identifier,
  Column,
} from '@zensql/ast';
import { buildIdentifier } from './utils';

export const TableConstraints = {
  PrimaryKey: (...columns: Array<string>): PrimaryKeyTableConstraint =>
    Node.create('PrimaryKeyTableConstraint', {
      columns: columns.map(col => buildIdentifier(col)),
    }),
  ReferenceTableConstraint: (
    column: string | Identifier,
    foreignKey: Column
  ): ReferenceTableConstraint =>
    Node.create('ReferenceTableConstraint', {
      column: buildIdentifier(column),
      foreignKey,
    }),
};
