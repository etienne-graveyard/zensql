import { Parser } from './Parser';
import { Serializer } from './Serializer';

export { InputStream } from './InputStream';
export { Keyword, Keywords } from './Keyword';
export {
  Expression,
  Identifier,
  Node,
  NodeIs,
  Statement,
  TableExpression,
  BinaryOperation,
  Term,
  Value,
  Variable,
  DataType,
  SelectExpression,
  SelectExpressionItem,
  Statements,
} from './Node';
export { BooleanOperator, CompareOperator, ValueOperator } from './Operator';
export { Parser, Result } from './Parser';
export { Serializer } from './Serializer';
export {
  Token,
  TokenComment,
  TokenIdentifier,
  TokenQuotedIdentifier,
  TokenIs,
  TokenMath,
  TokenNumber,
  TokenPunctuation,
  TokenStar,
  TokenString,
  TokenVariable,
} from './Token';
export { TokenStream } from './TokenStream';

const Sql = {
  parse: Parser.parse,
  serialize: Serializer.serialize,
};

export default Sql;
