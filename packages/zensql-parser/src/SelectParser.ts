import { Node, Expression, Identifier, SelectExpression, SelectExpressionItem, TableExpression } from './Node';
import { TokenStream } from './TokenStream';
import { ParserUtils } from './ParserUtils';
import { ExpressionParser } from './ExpressionParser';

export function SelectParser(input: TokenStream) {
  const {
    skipComment,
    isStar,
    skipStar,
    isKeyword,
    unexpected,
    parseMultiple,
    skipKeyword,
    parseIdentifier,
    isPunctuation,
    skipPunctuation,
    parseTable,
  } = ParserUtils(input);
  const { parseExpression } = ExpressionParser(input);

  return {
    parseSelectStatement,
  };

  function parseSelectStatement(): Node<'SelectStatement'> {
    const select = parseSelectExpression();
    const fromExpression = parseFromExpression();
    return {
      type: 'SelectStatement',
      select,
      from: fromExpression,
    };
  }

  function parseSelectExpression(): SelectExpression {
    skipComment();
    const items = parseMultiple(',', parseSelectExpressionItem);
    skipComment();
    if (items.length === 0) {
      return unexpected();
    }
    return items;
  }

  function parseFromExpression(): Node<'FromExpression'> {
    skipComment();
    if (!isKeyword('FROM')) {
      return unexpected('Missing FROM statement');
    }
    skipKeyword('FROM');
    const tables = parseMultiple(',', parseFromExpressionTable);
    skipComment();
    const where = parseWhereExpression();
    if (tables.length === 0) {
      return unexpected();
    }
    return {
      type: 'FromExpression',
      tables,
      where,
    };
  }

  function parseWhereExpression(): null | Expression {
    skipComment();
    if (!isKeyword('WHERE')) {
      return null;
    }
    skipKeyword('WHERE');
    return parseExpression();
  }

  function parseSelectExpressionItem(): SelectExpressionItem {
    skipComment();
    if (isStar()) {
      skipStar();
      return {
        type: 'ColumnAll',
      };
    }
    const column = parseColumn();
    if (column.schema === null && isStar()) {
      skipStar();
      return {
        type: 'ColumnAllFromTable',
        schema: column.table,
        table: column.column,
      };
    }
    if (isKeyword('AS')) {
      skipKeyword('AS');
      const alias = parseIdentifier(false);
      return {
        type: 'ColumnAlias',
        alias,
        schema: column.schema,
        table: column.table,
        column: column.column,
      };
    }
    return column;
  }

  function parseColumn(): Node<'Column'> {
    const first = parseIdentifier(false);
    let second: Identifier | null = null;
    let third: Identifier | null = null;
    if (isPunctuation('.')) {
      skipPunctuation('.');
      if (isStar() === false) {
        second = parseIdentifier(true);
        if (isPunctuation('.')) {
          skipPunctuation('.');
          if (isStar() === false) {
            third = parseIdentifier(true);
          }
        }
      }
    }
    const [schema, table, column] = third
      ? [first, second, third]
      : second
      ? [null, first, second]
      : [null, null, first];
    return {
      type: 'Column',
      schema,
      table,
      column,
    };
  }

  function parseFromExpressionTable(): TableExpression {
    skipComment();
    let table: TableExpression = parseTableOrTableAlias();
    while (isKeyword('LEFT')) {
      skipKeyword('LEFT');
      skipKeyword('JOIN');
      const right = parseTableOrTableAlias();
      skipKeyword('ON');
      const condition = parseExpression();
      const join: Node<'LeftJoin'> = {
        type: 'LeftJoin',
        left: table,
        condition,
        right,
      };
      table = join;
    }
    return table;
  }

  function parseTableOrTableAlias(): Node<'Table' | 'TableAlias'> {
    const table = parseTable();
    if (isKeyword('AS')) {
      skipKeyword('AS');
      return {
        type: 'TableAlias',
        table,
        alias: parseIdentifier(true),
      };
    }
    return table;
  }
}
