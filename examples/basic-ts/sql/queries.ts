import {
  Select,
  Column,
  Table,
  Equal,
  Variable,
  FromExpression,
  InsertInto,
} from '@zensql/builder';

const getClientById = Select({
  columns: [Column('id'), Column('name')],
  from: FromExpression({
    tables: Table('clients'),
    where: Equal(Column('id'), Variable('clientId')),
  }),
});

const insertClient = InsertInto('clients', ['id', 'name'], [Variable('id'), Variable('name')]);

export const QUERIES = {
  getClientById,
  insertClient,
};
