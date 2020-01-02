import {
  DataTypeInternal,
  DataTypeIntParamName,
  DataTypeNoParamsName,
  DataTypeNumericName,
  DATATYPE_INTPARAM,
  DATATYPE_NOPARAMS,
  DATATYPE_NUMERIC,
  Node,
  DataTypeUtils,
  TsType,
  DataType as DataTypeNode,
} from '@zensql/ast';

export const DataType = {
  ...createDataTypeBuilder(),
  withTsTypes,
};

function withTsTypes(dt: DataTypeInternal, tsType: TsType): DataTypeNode {
  return Node.create('DataType', {
    dt,
    tsType,
  });
}

export interface CreateNumericDataType {
  (p: number, s: number): DataTypeInternal;
  (): DataTypeInternal;
}

type DataTypeBuilder = {
  [K in DataTypeNoParamsName]: () => DataTypeInternal;
} &
  { [K in DataTypeIntParamName]: (num?: number | null) => DataTypeInternal } &
  {
    [K in DataTypeNumericName]: CreateNumericDataType;
  };

function createDataTypeBuilder(): DataTypeBuilder {
  const res: any = {};
  Object.keys(DATATYPE_NOPARAMS).forEach(name => {
    res[name] = () => DataTypeUtils.create(name as DataTypeNoParamsName, {});
  });
  Object.keys(DATATYPE_INTPARAM).forEach(name => {
    res[name] = (num: number | null = null) =>
      DataTypeUtils.create(name as DataTypeIntParamName, { param: num });
  });
  Object.keys(DATATYPE_NUMERIC).forEach(name => {
    res[name] = (p?: number, s?: number) =>
      DataTypeUtils.create(name as DataTypeNumericName, {
        params: p !== undefined && s !== undefined ? { s, p } : null,
      });
  });
  return res;
}
