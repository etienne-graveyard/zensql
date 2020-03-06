import { Node, Identifier, Expression } from '@zensql/ast';

export function buildIdentifier(val: string | Identifier): Identifier {
  if (typeof val !== 'string' && Node.is('Identifier', val)) {
    return val;
  }
  return Node.create('Identifier', {
    value: val.toLowerCase(),
    originalValue: val,
    caseSensitive: false,
  });
}

export function expressionFrom(val: Expression | string | number | boolean): Expression {
  if (typeof val === 'number') {
    return Node.create('Numeric', { value: val });
  }
  if (typeof val === 'string') {
    return Node.create('Str', { value: val });
  }
  if (typeof val === 'boolean') {
    return Node.create('Bool', { value: val });
  }
  if (val === null) {
    return Node.create('Null', {});
  }
  if ('type' in val && Node.is(val.type, val)) {
    return val;
  }
  throw new Error(`Cannot convert ${val} to Expression Node !`);
}
