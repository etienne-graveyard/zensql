import { TsInlineType, TsExternalType, Node } from '@zensql/ast';

export const TsType = {
  inline: createTsInlineType,
  external: createTsExternalType,
};

function createTsInlineType(type: string): TsInlineType {
  return Node.create('TsInlineType', { typeStr: type });
}

function createTsExternalType(module: string, name: string): TsExternalType {
  return Node.create('TsExternalType', { module, typeName: name });
}
