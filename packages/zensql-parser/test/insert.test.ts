import { Parser } from '../src';

const sql = String.raw;

it('parse a query', () => {
  const QUERY = sql`
    INSERT INTO some_table (column1, column2, column3)
    VALUES (:var, 45, 56);
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});

it('parse a query', () => {
  const QUERY = sql`
    INSERT INTO some_table (column1, column2, column3)
    VALUES ($2, 45 + 345, true);
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});

it('parse a query without columns', () => {
  const QUERY = sql`
    INSERT INTO some_table VALUES ($2, 45 + 345, true);
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});

it('parse a query with multiple values', () => {
  const QUERY = sql`
    INSERT INTO some_table (column1, column2, column3)
    VALUES ($2, 45 + 345, true), (2, 3, false);
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});

it('throw when insert does not have values', () => {
  const QUERY = sql`INSERT INTO some_table (column1, column2, column3) VALUES;`;
  expect(() => Parser.parse(QUERY)).toThrow();
});
