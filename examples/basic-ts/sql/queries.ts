import {
  Select,
  Column,
  Table,
  Equal,
  Variable,
  FromExpression,
  InsertInto,
  ColumnAll,
} from '@zensql/builder';

const getClientById = Select({
  columns: [Column('id'), Column('name'), Column('infos')],
  from: FromExpression({
    tables: Table('clients'),
    where: Equal(Column('id'), Variable('clientId')),
    limit: 1,
  }),
});

const insertClient = InsertInto(
  'clients',
  ['id', 'name', 'infos'],
  [Variable('id'), Variable('name'), Variable('infos')]
);

const getAllClearance = Select({
  columns: ColumnAll(),
  from: FromExpression({
    tables: Table('has_clearance'),
  }),
});

export const QUERIES = {
  getClientById,
  insertClient,
  getAllClearance,
};
