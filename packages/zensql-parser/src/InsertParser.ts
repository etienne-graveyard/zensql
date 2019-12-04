import { TokenStream } from './core/TokenStream';
import { Node } from './core/Node';
import { ParserUtils } from './utils/ParserUtils';
import { ExpressionParser } from './utils/ExpressionParser';

export function InsertParser(input: TokenStream) {
  const { skipKeyword, parseTable, skipPunctuation, parseIdentifier, parseMultiple, createNode } = ParserUtils(input);
  const { parseExpression } = ExpressionParser(input);

  return {
    parseInsertStatement,
  };

  function parseInsertStatement(): Node<'InsertStatement'> {
    skipKeyword('INSERT');
    skipKeyword('INTO');
    const table = parseTable();
    skipPunctuation('(');
    const columns = parseMultiple(',', () => parseIdentifier(false));
    skipPunctuation(')');
    skipKeyword('VALUES');
    skipPunctuation('(');
    const values = parseMultiple(',', () => parseExpression());
    skipPunctuation(')');
    return createNode('InsertStatement', {
      table,
      columns,
      values,
    });
  }
}
