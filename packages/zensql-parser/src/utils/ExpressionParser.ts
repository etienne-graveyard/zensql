import { TokenStream } from '../core/TokenStream';
import { Expression, Node, Identifier } from '../core/Node';
import { TokenIs, Token } from '../core/Token';
import { ValueOperator, BooleanOperator, CompareOperator, Operators } from '../core/Operator';
import { ParserUtils } from './ParserUtils';

export function ExpressionParser(input: TokenStream) {
  const {
    isKeyword,
    unexpected,
    isKeywordToken,
    isPunctuation,
    skipPunctuation,
    isStar,
    parseIdentifier,
    createNode,
  } = ParserUtils(input);

  return {
    parseExpression,
  };

  function parseExpression(): Expression {
    return maybeOperation(parseAtom(), 0);
  }

  function maybeOperation(left: Expression, myPrec: number): Expression {
    const tok = input.maybePeek();
    if (tok === null) {
      return left;
    }
    if (TokenIs.Math(tok) || TokenIs.Star(tok)) {
      const valOp = getValueOperator(tok);
      const hisPrec = Operators.getPrecedence(valOp);
      if (hisPrec > myPrec) {
        input.next();
        const nextLeft = createNode('ValueOperation', {
          left,
          operator: valOp,
          right: maybeOperation(parseAtom(), hisPrec),
        });
        return maybeOperation(nextLeft, myPrec);
      }
    }
    if (TokenIs.Operator(tok)) {
      const compOp = getCompareOperator(tok);
      const hisPrec = Operators.getPrecedence(compOp);
      if (hisPrec > myPrec) {
        input.next();
        const nextLeft = createNode('CompareOperation', {
          left,
          operator: compOp,
          right: maybeOperation(parseAtom(), hisPrec),
        });
        return maybeOperation(nextLeft, myPrec);
      }
    }
    if (isKeywordToken(tok, 'OR') || isKeywordToken(tok, 'AND')) {
      const boolOp = getBoleanOperator(tok);
      const hisPrec = Operators.getPrecedence(boolOp);
      if (hisPrec > myPrec) {
        input.next();
        const nextLeft = createNode('BooleanOperation', {
          left,
          operator: boolOp,
          right: maybeOperation(parseAtom(), hisPrec),
        });
        return maybeOperation(nextLeft, myPrec);
      }
    }
    return left;
  }

  function parseAtom(): Expression {
    if (isPunctuation('(')) {
      input.next();
      const exp = parseExpression();
      skipPunctuation(')');
      return exp;
    }
    if (TokenIs.Identifier(input.peek()) || TokenIs.QuotedIdentifier(input.peek())) {
      return parseColumnExpression();
    }
    // if (TokenIs.QuotedIdentifier(input.peek())) {
    //   return { type: 'CaseSensitiveIdentifier', value: tok.value };
    // }
    if (isKeyword()) {
      return createNode('Null', {});
    }
    const tok = input.next();
    if (TokenIs.NamedVariable(tok)) {
      return createNode('NamedVariable', { name: tok.name });
    }
    if (TokenIs.IndexedVariable(tok)) {
      return createNode('IndexedVariable', { num: tok.num });
    }
    if (TokenIs.Number(tok)) {
      return createNode('Numeric', { value: tok.value });
    }
    if (TokenIs.String(tok)) {
      return createNode('String', { value: tok.value.toLowerCase() });
    }
    return unexpected();
  }

  function getValueOperator(tok: Token<'Star' | 'Math'>): ValueOperator {
    if (TokenIs.Star(tok)) {
      return ValueOperator.Multiply;
    }
    if (TokenIs.Math(tok)) {
      const v = tok.value;
      return v === '+'
        ? ValueOperator.Plus
        : v === '-'
        ? ValueOperator.Minus
        : v === '/'
        ? ValueOperator.Divide
        : v === '%'
        ? ValueOperator.Modulo
        : unexpected();
    }
    return unexpected();
  }

  function getCompareOperator(tok: Token<'Operator'>): CompareOperator {
    if (TokenIs.Operator(tok)) {
      const v = tok.value;
      return v === '='
        ? CompareOperator.Equal
        : v === '<>' || v === '!='
        ? CompareOperator.NotEqual
        : v === '<='
        ? CompareOperator.LessOrEqual
        : v === '>='
        ? CompareOperator.GreaterOrEqual
        : v === '<'
        ? CompareOperator.Less
        : v === '>'
        ? CompareOperator.Greater
        : unexpected();
    }
    return unexpected();
  }

  function getBoleanOperator(tok: Token<'Identifier'>): BooleanOperator {
    if (TokenIs.Identifier(tok)) {
      if (isKeywordToken(tok, 'AND')) {
        return BooleanOperator.And;
      }
      if (isKeywordToken(tok, 'OR')) {
        return BooleanOperator.Or;
      }
      return unexpected();
    }
    return unexpected();
  }

  function parseColumnExpression(): Node<'Column'> {
    const first = parseIdentifier(false);
    let second: Identifier | null = null;
    let third: Identifier | null = null;
    if (isPunctuation('.')) {
      skipPunctuation('.');
      second = parseIdentifier(true);
      if (isPunctuation('.')) {
        skipPunctuation('.');
        if (isStar() === false) {
          third = parseIdentifier(true);
        }
      }
    }
    const [schema, table, column] = third
      ? [first, second, third]
      : second
      ? [null, first, second]
      : [null, null, first];
    return createNode('Column', {
      schema,
      table,
      column,
    });
  }
}