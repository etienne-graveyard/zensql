export type DataTypeType = keyof DataTypesData;

export const DataTypeUtils = {
  create: createDataType,
  is: dataTypeIs,
  typeIs: dataTypeTypeIs,
};

function createDataType<K extends keyof DataTypesData>(
  type: K,
  data: DataTypesData[K]
): AllDataTypes[K] {
  const node: DataTypeInternal<K> = {
    type,
    ...data,
  } as any;
  return node;
}

function dataTypeIs<K extends DataTypeType>(
  type: K,
  dataType: DataTypeInternal
): dataType is DataTypeInternal<K> {
  return dataType.type === type;
}

function dataTypeTypeIs<T extends ReadonlyArray<DataTypeType>>(
  maybeType: string,
  valids: T
): maybeType is T extends ReadonlyArray<infer U> ? U : never {
  return valids.indexOf(maybeType as any) >= 0;
}

export interface DataTypesData {
  // No params
  BOOL: {};
  BOOLEAN: {};
  TEXT: {};
  INT: {};
  SMALLINT: {};
  INTEGER: {};
  SERIAL: {};
  DATE: {};
  UUID: {};
  REAL: {};
  // JSON
  JSON: {};
  JSONB: {};
  // Int param
  CHAR: { param: null | number };
  CHARACTER: { param: null | number };
  VARCHAR: { param: null | number };
  TIME: { param: null | number };
  TIMESTAMP: { param: null | number };
  TIMESTAMPTZ: { param: null | number };
  INTERVAL: { param: null | number };
  // Numeric
  NUMERIC: { params: null | { p: number; s: number } };
  DECIMAL: { params: null | { p: number; s: number } };
}

export type DataTypeInternal<K extends DataTypeType = DataTypeType> = AllDataTypes[K];

export type AllDataTypes = {
  [K in DataTypeType]: DataTypesData[K] & { type: K };
};

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

export type DataTypeNameAny = keyof typeof DATATYPE;
export type DataTypeNoParamsName = keyof typeof DATATYPE_NOPARAMS;
export type DataTypeIntParamName = keyof typeof DATATYPE_INTPARAM;
export type DataTypeNumericName = keyof typeof DATATYPE_NUMERIC;
