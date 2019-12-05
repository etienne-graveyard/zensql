import { TokenStream } from '../core/TokenStream';
import { Node } from '../core/Node';
import { ParserUtils } from '../utils/ParserUtils';

export function AlterTableParser(input: TokenStream) {
  const { skipKeyword, createNode, parseTable } = ParserUtils(input);

  return {
    parseAlterTableStatement,
  };

  function parseAlterTableStatement(): Node<'AlterTableStatement'> {
    skipKeyword('ALTER');
    skipKeyword('TABLE');
    const table = parseTable();
    skipKeyword('ADD');
    input.croak('TODO');
    return createNode('AlterTableStatement', {
      table,
    });
  }
}
