import { Parser } from './Parser';
import { Serializer } from './Serializer';

export { InputStream } from './core/InputStream';
export { Keyword, Keywords } from './core/Keyword';
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
  Constraint,
  NodeType,
  TableConstraint,
} from './core/Node';
export { BooleanOperator, CompareOperator, ValueOperator } from './core/Operator';
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
} from './core/Token';
export { TokenStream } from './core/TokenStream';

const Sql = {
  parse: Parser.parse,
  serialize: Serializer.serialize,
};

export default Sql;
