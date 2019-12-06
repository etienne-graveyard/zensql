export const DATATYPE_NOPARAMS = {
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

export const DATATYPE_INTPARAM = {
  CHAR: 'CHAR',
  CHARACTER: 'CHARACTER',
  VARCHAR: 'VARCHAR',
  TIME: 'TIME',
  TIMESTAMP: 'TIMESTAMP',
  TIMESTAMPTZ: 'TIMESTAMPTZ',
  INTERVAL: 'INTERVAL',
};

export const DATATYPE_NUMERIC = {
  NUMERIC: 'NUMERIC',
  DECIMAL: 'DECIMAL',
};

export const DATATYPE = {
  ...DATATYPE_NOPARAMS,
  ...DATATYPE_INTPARAM,
  ...DATATYPE_NUMERIC,
};

export const DataTypes = {
  isDataType(str: string): str is DataTypeNameAny {
    const upper = str.toUpperCase();
    return (DATATYPE as any)[upper] === upper;
  },
  isNoParamsDataType(str: string): str is DataTypeNoParamsName {
    const upper = str.toUpperCase();
    return (DATATYPE_NOPARAMS as any)[upper] === str;
  },
  isIntParamDataType(str: string): str is DataTypeIntParamName {
    const upper = str.toUpperCase();
    return (DATATYPE_INTPARAM as any)[upper] === str;
  },
  isNumericDataType(str: string): str is DataTypeNumericName {
    const upper = str.toUpperCase();
    return (DATATYPE_NUMERIC as any)[upper] === str;
  },
};

export type DataTypeNameAny = keyof typeof DATATYPE;
export type DataTypeNoParamsName = keyof typeof DATATYPE_NOPARAMS;
export type DataTypeIntParamName = keyof typeof DATATYPE_INTPARAM;
export type DataTypeNumericName = keyof typeof DATATYPE_NUMERIC;
