import { TokenStream } from './TokenStream';
import { TokenIs, TokenPunctuation, TokenStar, TokenIdentifier, Token } from './Token';
import { Keyword, Keywords } from './Keyword';
import { Identifier, Node } from './Node';
import { DataTypeAny, DataTypes } from './DataType';

export function ParserUtils(input: TokenStream) {
  return {
    skipComment,
    skipPunctuation,
    skipKeyword,
    skipStar,
    isStar,
    isKeyword,
    unexpected,
    parseMultiple,
    isKeywordToken,
    isPunctuation,
    parseIdentifier,
    isDataType,
    skipDataType,
    parseInteger,
    parseTable,
  };

  function skipComment(): void {
    const next = input.maybePeek();
    if (next && TokenIs.Comment(next)) {
      input.next();
      return skipComment();
    }
  }

  function isPunctuation(ch?: string): false | TokenPunctuation {
    const tok = input.maybePeek();
    return tok !== null && TokenIs.Punctuation(tok) && (!ch || tok.value == ch) && tok;
  }

  function isStar(): false | TokenStar {
    const tok = input.maybePeek();
    return tok !== null && TokenIs.Star(tok) && tok;
  }

  function isKeyword(keyword?: Keyword): false | TokenIdentifier {
    const tok = input.maybePeek();
    return tok !== null && isKeywordToken(tok, keyword) ? tok : false;
  }

  function isKeywordToken(tok: Token, keyword?: Keyword): tok is TokenIdentifier {
    return (
      tok !== null &&
      TokenIs.Identifier(tok) &&
      (keyword ? tok.value.toUpperCase() === keyword : Keywords.isKeyword(tok.value.toUpperCase()))
    );
  }

  function isDataType(dt?: DataTypeAny): false | TokenIdentifier {
    const tok = input.maybePeek();
    return tok !== null && isDataTypeToken(tok, dt) ? tok : false;
  }

  function isDataTypeToken(tok: Token, dt?: DataTypeAny): tok is TokenIdentifier {
    return (
      tok !== null &&
      TokenIs.Identifier(tok) &&
      (dt ? tok.value.toUpperCase() === dt : DataTypes.isDataType(tok.value.toUpperCase()))
    );
  }

  function skipStar(): void {
    if (isStar()) {
      input.next();
    } else {
      input.croak('Expecting *');
    }
  }

  function skipKeyword(keyword: Keyword): void {
    if (isKeyword(keyword)) {
      input.next();
    } else {
      input.croak('Expecting keywork: "' + keyword + '"');
    }
  }

  function skipDataType(dt?: DataTypeAny): void {
    if (isDataType(dt)) {
      input.next();
    } else {
      input.croak(`Expecting DataType` + dt ? ` "${dt}"` : '');
    }
  }

  function skipPunctuation(ch: string): void {
    if (isPunctuation(ch)) {
      input.next();
    } else {
      input.croak('Expecting punctuation: "' + ch + '"');
    }
  }

  function unexpected(msg?: string): never {
    return input.croak(msg ? msg : 'Unexpected token: ' + JSON.stringify(input.peek()));
  }

  function parseMultiple<T>(separator: string, parser: () => T): Array<T> {
    const a: Array<T> = [];
    while (!input.eof()) {
      a.push(parser());
      if (isPunctuation(separator)) {
        skipPunctuation(separator);
      } else {
        break;
      }
    }
    return a;
  }

  function parseInteger(): number {
    const tok = input.next();
    if (!TokenIs.Number(tok)) {
      return unexpected();
    }
    if (!Number.isInteger(tok.value)) {
      return unexpected(`Expected an integer, got ${tok.value}`);
    }
    return tok.value;
  }

  function parseIdentifier(allowKeyword: boolean): Identifier {
    const next = input.peek();
    if (allowKeyword === false && isKeywordToken(next)) {
      unexpected();
    }
    if (TokenIs.QuotedIdentifier(next)) {
      input.next();
      return {
        type: 'CaseSensitiveIdentifier',
        value: next.value,
      };
    }
    if (TokenIs.Identifier(next)) {
      input.next();
      return {
        type: 'Identifier',
        value: next.value.toLowerCase(),
      };
    }
    return unexpected();
  }

  function parseTable(): Node<'Table'> {
    const first = parseIdentifier(false);
    const second = isPunctuation('.') ? (skipPunctuation('.'), parseIdentifier(true)) : null;
    const [schema, table] = second === null ? [null, first] : [first, second];
    return {
      type: 'Table',
      schema,
      table,
    };
  }
}
