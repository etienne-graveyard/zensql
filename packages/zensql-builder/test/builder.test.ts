import { Builder } from '../src';

it('build a create table', () => {
  expect(
    Builder.CREATE_TABLE.create('doc', [
      Builder.CREATE_TABLE.COLUMN('id', Builder.TYPES.UUID()),
      Builder.CREATE_TABLE.COLUMN('name', Builder.TYPES.TEXT()),
    ])
  ).toEqual({
    items: [
      {
        constraints: [],
        dataType: { dt: 'UUID', type: 'DataTypeNoParams' },
        name: { type: 'Identifier', value: 'id' },
        type: 'ColumnDef',
      },
      {
        constraints: [],
        dataType: { dt: 'TEXT', type: 'DataTypeNoParams' },
        name: { type: 'Identifier', value: 'name' },
        type: 'ColumnDef',
      },
    ],
    table: {
      schema: null,
      table: { type: 'Identifier', value: 'doc' },
      type: 'Table',
    },
    type: 'CreateTableStatement',
  });
});
