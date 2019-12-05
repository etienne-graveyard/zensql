import {
  DataType,
  DataTypeIntParam,
  DataTypeNoParams,
  DataTypeNumeric,
  DATATYPE_INTPARAM,
  DATATYPE_NOPARAMS,
  DATATYPE_NUMERIC,
  Node,
} from '@zensql/ast';

export const TYPES = createDataTypeBuilder();

export interface CreateNumericDataType {
  (p: number, s: number): DataType;
  (): DataType;
}

type DataTypeBuilder = {
  [K in DataTypeNoParams]: () => DataType;
} &
  { [K in DataTypeIntParam]: (num?: number | null) => DataType } &
  {
    [K in DataTypeNumeric]: CreateNumericDataType;
  };

function createDataTypeBuilder(): DataTypeBuilder {
  // TODO:
  const res: any = {};
  Object.keys(DATATYPE_NOPARAMS).forEach(name => {
    res[name] = () => Node.create('DataTypeNoParams', { dt: name as any });
  });
  Object.keys(DATATYPE_INTPARAM).forEach(name => {
    res[name] = (num: number | null = null) =>
      Node.create('DataTypeIntParams', { dt: name as any, param: num });
  });
  Object.keys(DATATYPE_NUMERIC).forEach(name => {
    res[name] = (p?: number, s?: number) =>
      Node.create('DataTypeNumeric', {
        dt: name as any,
        params: p !== undefined && s !== undefined ? { s, p } : null,
      });
  });
  return res;
}
