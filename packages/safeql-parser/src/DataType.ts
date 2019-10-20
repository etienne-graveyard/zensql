const DATATYPE_NOPARAMS = {
  BOOL: 'BOOL',
  BOOLEAN: 'BOOLEAN',
  TEXT: 'TEXT',

  INT: 'INT',
  SMALLINT: 'SMALLINT',
  INTEGER: 'INTEGER',
  SERIAL: 'SERIAL',
  DATE: 'DATE',

  JSON: 'JSON',
  JSONB: 'JSONB',
  UUID: 'UUID',
  REAL: 'REAL',
};

const DATATYPE_INTPARAM = {
  CHAR: 'CHAR',
  CHARACTER: 'CHARACTER',
  VARCHAR: 'VARCHAR',
  TIME: 'TIME',
  TIMESTAMP: 'TIMESTAMP',
  TIMESTAMPTZ: 'TIMESTAMPTZ',
  INTERVAL: 'INTERVAL',
};

const DATATYPE_NUMERIC = {
  NUMERIC: 'NUMERIC',
  DECIMAL: 'DECIMAL',
};

const DATATYPE = {
  ...DATATYPE_NOPARAMS,
  ...DATATYPE_INTPARAM,
  ...DATATYPE_NUMERIC,
};

export const DataTypes = {
  isDataType(str: string): str is DataTypeAny {
    const upper = str.toUpperCase();
    return (DATATYPE as any)[upper] === upper;
  },
  isNoParamsDataType(str: string): str is DataTypeNoParams {
    const upper = str.toUpperCase();
    return (DATATYPE_NOPARAMS as any)[upper] === str;
  },
  isIntParamDataType(str: string): str is DataTypeIntParam {
    const upper = str.toUpperCase();
    return (DATATYPE_INTPARAM as any)[upper] === str;
  },
  isNumericDataType(str: string): str is DataTypeNumeric {
    const upper = str.toUpperCase();
    return (DATATYPE_NUMERIC as any)[upper] === str;
  },
};

export type DataTypeAny = keyof typeof DATATYPE;
export type DataTypeNoParams = keyof typeof DATATYPE_NOPARAMS;
export type DataTypeIntParam = keyof typeof DATATYPE_INTPARAM;
export type DataTypeNumeric = keyof typeof DATATYPE_NUMERIC;
