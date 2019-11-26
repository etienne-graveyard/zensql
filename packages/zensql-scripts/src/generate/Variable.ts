import { ColumnResolved } from './Column';
import { Expression as ZenExpression, Node, NodeIs } from '@zensql/parser';
import { Expression, VariableResolved } from './Expression';

export const Variable = {
  resolve: resolveVariables,
  replace: replaceVariables,
};

function resolveVariables(allColumns: Array<ColumnResolved>, where: ZenExpression | null): Array<VariableResolved> {
  if (where === null) {
    return [];
  }
  const res = Expression.resolve(allColumns, where);
  if (res.resolved === false) {
    throw new Error(`Cannot resolve WHERE expression type !`);
  }
  return res.variables;
}

function replaceVariables(query: Node<'SelectStatement'>, variables: Array<VariableResolved>): Node<'SelectStatement'> {
  const transformedQuery: Node<'SelectStatement'> = {
    ...query,
    from: {
      ...query.from,
    },
  };
  if (query.from.where) {
    transformedQuery.from.where = replaceVariable(query.from.where, variables);
  }
  return transformedQuery;
}

function replaceVariable(expr: ZenExpression, variables: Array<VariableResolved>): ZenExpression {
  if (NodeIs.IndexedVariable(expr)) {
    throw new Error('IndexedVariables are not supported, use named variable instead !');
  }
  if (NodeIs.CompareOperation(expr) || NodeIs.BooleanOperation(expr) || NodeIs.ValueOperation(expr)) {
    const left = replaceVariable(expr.left, variables);
    const right = replaceVariable(expr.right, variables);
    if (left === expr.left && right === expr.right) {
      return expr;
    }
    return {
      ...expr,
      left,
      right,
    };
  }
  if (NodeIs.NamedVariable(expr)) {
    const num = variables.findIndex(v => v.name === expr.name);
    if (num === -1) {
      throw new Error(`Cannot find variable ${expr.name} in resolved variables !`);
    }
    return {
      type: 'IndexedVariable',
      num: num + 1,
      cursor: expr.cursor,
    };
  }

  return expr;
}
