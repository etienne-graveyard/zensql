import { TokenStream } from './core/TokenStream';
import { InputStream } from './core/InputStream';
import { Statements, Statement, Node, NodeIs } from './core/Node';
import { ParserUtils } from './utils/ParserUtils';
import { SelectParser } from './SelectParser';
import { CreateParser } from './CreateParser';
import { InsertParser } from './InsertParser';

export const Parser = {
  parse,
};

export type Result = Statements | Statement | Node<'Empty'>;

function parse(inputStr: string): Result {
  const inputStream = InputStream(inputStr);
  const input = TokenStream(inputStream);

  const { skipComment, skipPunctuation, isKeyword, unexpected, createNode } = ParserUtils(input);
  const { parseSelectStatement } = SelectParser(input);
  const { parseCreateStatement } = CreateParser(input);
  const { parseInsertStatement } = InsertParser(input);

  return parseTopLevel();

  function parseTopLevel(): Result {
    const statements: Statements = [];
    while (!input.eof()) {
      skipComment();
      const next = parseStatement();
      skipComment();
      statements.push(next);
      const alowSemicolon =
        NodeIs.SelectStatement(next) || NodeIs.CreateTableStatement(next) || NodeIs.InsertStatement(next);
      if (!input.eof() && alowSemicolon) {
        skipPunctuation(';');
      }
      skipComment();
    }
    if (statements.length === 0) {
      return createNode('Empty', {});
    }
    if (statements.length === 1) {
      return statements[0];
    }
    return statements;
  }

  function parseStatement(): Statement {
    skipComment();
    if (isKeyword('SELECT')) {
      return parseSelectStatement();
    }
    if (isKeyword('CREATE')) {
      return parseCreateStatement();
    }
    if (isKeyword('INSERT')) {
      return parseInsertStatement();
    }
    return unexpected();
  }
}
