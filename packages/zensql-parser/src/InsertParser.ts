import { TokenStream } from './core/TokenStream';
import { Node, Identifier } from './core/Node';
import { ParserUtils } from './utils/ParserUtils';
import { ExpressionParser } from './utils/ExpressionParser';

export function InsertParser(input: TokenStream) {
  const {
    skipKeyword,
    parseTable,
    skipPunctuation,
    parseIdentifier,
    parseMultiple,
    createNode,
    isPunctuation,
  } = ParserUtils(input);
  const { parseExpression } = ExpressionParser(input);

  return {
    parseInsertStatement,
  };

  function parseInsertStatement(): Node<'InsertStatement'> {
    skipKeyword('INSERT');
    skipKeyword('INTO');
    const table = parseTable();
    const columns = parseMaybeColumns();
    skipKeyword('VALUES');
    const values = parseMultiple(',', () => parseValues());
    return createNode('InsertStatement', {
      table,
      columns,
      values,
    });
  }

  function parseValues(): Node<'InserValues'> {
    skipPunctuation('(');
    const values = parseMultiple(',', () => parseExpression());
    skipPunctuation(')');
    return createNode('InserValues', { values });
  }

  function parseMaybeColumns(): Array<Identifier> | null {
    if (isPunctuation('(')) {
      skipPunctuation('(');
      const columns = parseMultiple(',', () => parseIdentifier(false));
      skipPunctuation(')');
      return columns;
    }
    return null;
  }
}
