import { TokenStream } from './TokenStream';
import { Node, DataType, Identifier } from './Node';
import { ParserUtils } from './ParserUtils';
import { DataTypes } from './DataType';

export function CreateParser(input: TokenStream) {
  const {
    skipKeyword,
    parseIdentifier,
    isPunctuation,
    skipPunctuation,
    parseMultiple,
    skipComment,
    isDataType,
    skipDataType,
    unexpected,
    parseInteger,
    isKeyword,
    parseTable,
  } = ParserUtils(input);

  return {
    parseCreateStatement,
  };

  function parseCreateStatement(): Node<'CreateTableStatement'> {
    skipKeyword('TABLE');
    const table = parseTable();
    skipPunctuation('(');
    const columns = parseMultiple(',', parseColumnDef);
    skipPunctuation(')');
    return {
      type: 'CreateTableStatement',
      table,
      columns,
    };
  }

  function parseColumnDef(): Node<'ColumnDef'> {
    skipComment();
    const name = parseIdentifier(false);
    const dataType = parseDataType();
    let nullable = parseMaybeNotNull();
    let unique = false;
    const primary = parseMaybePrimaryKey();
    const reference = parseMaybeReference();

    if (primary) {
      nullable = false;
      unique = true;
    }

    return {
      type: 'ColumnDef',
      dataType,
      name,
      nullable,
      unique,
      primary,
      reference,
    };
  }

  function parseMaybeReference(): null | Node<'Column'> {
    if (!isKeyword('REFERENCES')) {
      return null;
    }
    skipKeyword('REFERENCES');
    const first = parseIdentifier(false);
    let second: Identifier | null = null;
    if (isPunctuation('.')) {
      skipPunctuation('.');
      second = parseIdentifier(true);
    }
    skipPunctuation('(');
    const column = parseIdentifier(false);
    skipPunctuation(')');

    const [schema, table] = second ? [first, second] : [null, first];

    return {
      type: 'Column',
      schema,
      table,
      column,
    };
  }

  function parseMaybeNotNull(): boolean {
    if (isKeyword('NOT')) {
      skipKeyword('NOT');
      skipKeyword('NULL');
      return false;
    }
    return true;
  }

  function parseMaybePrimaryKey(): boolean {
    if (isKeyword('PRIMARY')) {
      skipKeyword('PRIMARY');
      skipKeyword('KEY');
      return true;
    }
    return false;
  }

  function parseDataType(): DataType {
    const dtTok = isDataType();
    if (dtTok === false) {
      return unexpected();
    }
    const dt = dtTok.value.toUpperCase();
    skipDataType();
    if (DataTypes.isNoParamsDataType(dt)) {
      return {
        type: 'DataTypeNoParams',
        dt,
      };
    }
    if (DataTypes.isIntParamDataType(dt)) {
      const param = parseMaybeIntParam();
      return {
        type: 'DataTypeIntParams',
        dt,
        param,
      };
    }
    if (DataTypes.isNumericDataType(dt)) {
      return {
        type: 'DataTypeNumeric',
        dt,
        params: parseMaybeNumericParams(),
      };
    }
    return unexpected(`Unknow DataType ${dt}`);
  }

  function parseMaybeIntParam(): number | null {
    if (isPunctuation('(')) {
      skipPunctuation('(');
      const val = parseInteger();
      skipPunctuation(')');
      return val;
    }
    return null;
  }

  function parseMaybeNumericParams(): null | { p: number; s: number } {
    if (isPunctuation('(')) {
      skipPunctuation('(');
      const p = parseInteger();
      skipPunctuation(',');
      const s = parseInteger();
      skipPunctuation(')');
      return { p, s };
    }
    return null;
  }
}
