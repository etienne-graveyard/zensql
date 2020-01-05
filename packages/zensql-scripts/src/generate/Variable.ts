import { ColumnResolved, ColumnUtils } from '../common/ColumnUtils';
import {
  Expression,
  NodeInternal,
  Node,
  NodeType,
  InsertIntoStatement,
  Select,
  CompareOperator,
  UpdateStatement,
} from '@zensql/ast';
import { ExpressionUtils, VariableResolved } from '../common/ExpressionUtils';
import { TableUtils } from '../common/TableUtils';
import { Schema } from '../common/SchemaUtils';

export const Variable = {
  resolve: resolveVariables,
  replace: replaceVariables,
};

function resolveVariables<T extends NodeType>(
  schema: Schema,
  query: NodeInternal<T>
): Array<VariableResolved> {
  if (Node.is('Select', query)) {
    const tables = TableUtils.resolveFromExpression(schema, query.from);
    const allColumns = ColumnUtils.findAll(tables);
    return dedupeVariables(resolveVariablesInExpression(allColumns, query.from.where));
  }
  if (Node.is('InsertIntoStatement', query)) {
    const table = TableUtils.resolveTable(schema, query.table);
    const columns = ColumnUtils.resolveOnTable(table, query.columns);
    const result: Array<VariableResolved> = [];
    query.values.forEach(vals => {
      vals.values.forEach((expr, index) => {
        const column = columns[index];
        result.push(...resolveVariablesInInsertValues(column, expr));
      });
    });
    return result;
  }
  if (Node.is('UpdateStatement', query)) {
    const table = TableUtils.resolveTable(schema, query.table);
    const allColumns = ColumnUtils.findAll([table]);
    const allVariables = resolveVariablesInExpression(allColumns, query.where);
    query.items.forEach((item, index) => {
      const expr = Node.create('CompareOperation', {
        left: Node.create('Column', {
          schema: null,
          table: null,
          column: item.column,
        }),
        operator: CompareOperator.Equal,
        right: item.value,
      });
      const res = ExpressionUtils.resolve(allColumns, expr);
      if (res.resolved === false) {
        throw new Error(`Cannot resolve item ${index} in UPDATE !`);
      }
      allVariables.push(...res.variables);
    });
    return allVariables;
  }
  throw new Error(`Cannot resolve variables in Node if type ${query.type}`);
}

function dedupeVariables(allVariables: Array<VariableResolved>): Array<VariableResolved> {
  return allVariables.reduce<Array<VariableResolved>>((acc, variable) => {
    const alreadyIn = acc.find(v => v.name === variable.name);
    if (!alreadyIn) {
      acc.push(variable);
    } else {
      // TODO: Make sure alreadyIn and variable have the same type
      // If not the query is not valid because the same variable need to have two different types
    }
    return acc;
  }, []);
}

function resolveVariablesInInsertValues(
  column: ColumnResolved,
  expr: Expression | null
): Array<VariableResolved> {
  if (expr === null) {
    return [];
  }
  const res = ExpressionUtils.resolve([], expr);
  if (res.resolved === false) {
    return res.variables.map(
      (name): VariableResolved => ({
        name,
        type: {
          dt: column.type.dt,
          // FIXME:
          nullable: false,
        },
      })
    );
  } else {
    // TODO: Make sure res.type is the same as column
    return res.variables;
  }
}

function resolveVariablesInExpression(
  allColumns: Array<ColumnResolved>,
  expr: Expression | null
): Array<VariableResolved> {
  if (expr === null) {
    return [];
  }
  const res = ExpressionUtils.resolve(allColumns, expr);
  if (res.resolved === false) {
    throw new Error(`Cannot resolve WHERE expression type !`);
  }
  return res.variables;
}

function replaceVariables<T extends NodeType>(
  query: NodeInternal<T>,
  variables: Array<VariableResolved>
): NodeInternal {
  if (Node.is('Select', query)) {
    return replaceVariablesInSelect(query, variables);
  }
  if (Node.is('InsertIntoStatement', query)) {
    return replaceVariablesInInsert(query, variables);
  }
  if (Node.is('UpdateStatement', query)) {
    return replaceVariablesInUpdate(query, variables);
  }
  throw new Error(`Replacing variables in ${query.type} is not suported`);
}

function replaceVariablesInInsert(
  query: InsertIntoStatement,
  variables: Array<VariableResolved>
): InsertIntoStatement {
  const transformedQuery: InsertIntoStatement = {
    ...query,
    values: query.values.map(vals => ({
      ...vals,
      values: vals.values.map(exp => replaceVariableInExpression(exp, variables)),
    })),
  };
  return transformedQuery;
}

function replaceVariablesInUpdate(
  query: UpdateStatement,
  variables: Array<VariableResolved>
): UpdateStatement {
  const transformedQuery: UpdateStatement = {
    ...query,
    where: query.where ? replaceVariableInExpression(query.where, variables) : null,
    items: query.items.map(item => ({
      ...item,
      value: replaceVariableInExpression(item.value, variables),
    })),
  };
  return transformedQuery;
}

function replaceVariablesInSelect(query: Select, variables: Array<VariableResolved>): Select {
  const transformedQuery: Select = {
    ...query,
    from: {
      ...query.from,
    },
  };
  if (query.from.where) {
    transformedQuery.from.where = replaceVariableInExpression(query.from.where, variables);
  }
  return transformedQuery;
}

function replaceVariableInExpression(
  expr: Expression,
  variables: Array<VariableResolved>
): Expression {
  if (Node.is('IndexedVariable', expr)) {
    throw new Error('IndexedVariables are not supported, use named variable instead !');
  }
  if (
    Node.is('CompareOperation', expr) ||
    Node.is('BooleanOperation', expr) ||
    Node.is('ValueOperation', expr)
  ) {
    const left = replaceVariableInExpression(expr.left, variables);
    const right = replaceVariableInExpression(expr.right, variables);
    if (left === expr.left && right === expr.right) {
      return expr;
    }
    return {
      ...expr,
      left,
      right,
    };
  }
  if (Node.is('NamedVariable', expr)) {
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
