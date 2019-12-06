import {
  Column,
  Node,
  Variable,
  IndexedVariable,
  NamedVariable,
  Expression,
  CompareOperation,
  CompareOperator,
  Str,
} from '@zensql/ast';
import { buildIdentifier } from './utils';

export function Column(table: string, column: string): Column;
export function Column(column: string): Column;
export function Column(table: string, column?: string): Column {
  const [tab, col] = column === undefined ? [null, table] : [table, column];
  return Node.create('Column', {
    schema: null,
    table: tab === null ? null : buildIdentifier(tab),
    column: buildIdentifier(col),
  });
}

export function Variable(val: number): IndexedVariable;
export function Variable(val: string): NamedVariable;
export function Variable(val: number | string): Variable {
  if (typeof val === 'number') {
    return Node.create('IndexedVariable', { num: val });
  }
  return Node.create('NamedVariable', { name: val });
}

export function Equal(left: Expression, right: Expression): CompareOperation {
  return Node.create('CompareOperation', {
    left,
    right,
    operator: CompareOperator.Equal,
  });
}

export function Str(val: string): Str {
  return Node.create('Str', { value: val });
}
