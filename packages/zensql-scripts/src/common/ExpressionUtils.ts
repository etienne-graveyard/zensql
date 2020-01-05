import { ColumnType, ColumnResolved, ColumnUtils } from './ColumnUtils';
import { Expression, Node } from '@zensql/ast';

export const ExpressionUtils = {
  resolve: resolveExpression,
};

export interface VariableResolved {
  name: string;
  type: null | ColumnType;
}

interface ResolvedExpression {
  resolved: true;
  type: ColumnType;
  variables: Array<VariableResolved>;
}

interface PartiallyResolvedExpression {
  resolved: false;
  variables: Array<string>;
}

function resolveExpression(
  allColumns: Array<ColumnResolved>,
  expr: Expression
): ResolvedExpression | PartiallyResolvedExpression {
  if (Node.is('IndexedVariable', expr)) {
    throw new Error('IndexedVariables are not supported, use named variable instead !');
  }
  if (
    Node.is('CompareOperation', expr) ||
    Node.is('BooleanOperation', expr) ||
    Node.is('ValueOperation', expr)
  ) {
    const left = resolveExpression(allColumns, expr.left);
    const right = resolveExpression(allColumns, expr.right);
    if (left.resolved && right.resolved) {
      // TODO: Make sure it's the same type !
      return {
        resolved: true,
        type: right.type,
        variables: [...left.variables, ...right.variables],
      };
    }
    if (left.resolved === false && right.resolved === false) {
      return {
        resolved: false,
        variables: [...left.variables, ...right.variables],
      };
    }
    if (left.resolved || right.resolved) {
      const [value, partial]: [ResolvedExpression, PartiallyResolvedExpression] = left.resolved
        ? ([left, right] as any)
        : [right, left];
      return {
        resolved: true,
        type: value.type,
        variables: partial.variables.map(name => ({ type: value.type, name })),
      };
    }
    throw new Error('Whaaat ?');
  }
  if (Node.is('NamedVariable', expr)) {
    return {
      resolved: false,
      variables: [expr.name],
    };
  }
  if (Node.is('Column', expr)) {
    const col = ColumnUtils.resolveSingle(expr, allColumns);
    return {
      resolved: true,
      variables: [],
      type: col.type,
    };
  }
  if (Node.is('Bool', expr)) {
    return {
      resolved: true,
      type: {
        dt: {
          type: 'DataType',
          dt: {
            type: 'BOOLEAN',
          },
          tsType: null,
          cursor: expr.cursor,
        },
        nullable: false,
      },
      variables: [],
    };
  }
  if (Node.is('Str', expr)) {
    return {
      resolved: true,
      type: {
        dt: {
          type: 'DataType',
          dt: {
            type: 'CHARACTER',
            param: 100,
          },
          tsType: null,
          cursor: expr.cursor,
        },
        nullable: false,
      },
      variables: [],
    };
  }
  if (Node.is('Numeric', expr)) {
    return {
      resolved: true,
      type: {
        dt: {
          type: 'DataType',
          dt: {
            type: 'REAL',
          },
          cursor: expr.cursor,
          tsType: null,
        },
        nullable: false,
      },
      variables: [],
    };
  }

  throw new Error(`Unhandled ${expr.type}`);
}
