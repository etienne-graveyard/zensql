import { TokenStream } from './core/TokenStream';
import { InputStream } from './core/InputStream';
import { Statements, Statement, Node, NodeIs } from './core/Node';
import { ParserUtils } from './utils/ParserUtils';
import { SelectParser } from './statement/SelectParser';
import { CreateTableParser } from './statement/CreateTableParser';
import { InsertIntoParser } from './statement/InsertIntoParser';
import { AlterTableParser } from './statement/AlterTableParser';

export const Parser = {
  parse,
};

export type Result = Statements | Statement | Node<'Empty'>;

function parse(inputStr: string): Result {
  const inputStream = InputStream(inputStr);
  const input = TokenStream(inputStream);

  const { skipComment, skipPunctuation, isKeyword, unexpected, createNode } = ParserUtils(input);
  const { parseSelectStatement } = SelectParser(input);
  const { parseCreateStatement } = CreateTableParser(input);
  const { parseInsertStatement } = InsertIntoParser(input);
  const { parseAlterTableStatement } = AlterTableParser(input);

  return parseTopLevel();

  function parseTopLevel(): Result {
    const statements: Statements = [];
    while (!input.eof()) {
      skipComment();
      const next = parseStatement();
      skipComment();
      statements.push(next);
      const alowSemicolon =
        NodeIs.SelectStatement(next) ||
        NodeIs.CreateTableStatement(next) ||
        NodeIs.InsertIntoStatement(next) ||
        NodeIs.AlterTableStatement(next);
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
    if (isKeyword('ALTER')) {
      return parseAlterTableStatement();
    }
    return unexpected(`Expected a Statement`);
  }
}
