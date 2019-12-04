import { Parser } from '../src';

it('parse a query', () => {
  const QUERY = `
    INSERT INTO some_table (column1, column2, column3)
    VALUES (:var, 45, 56);
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});

it('parse a query', () => {
  const QUERY = `
    INSERT INTO some_table (column1, column2, column3)
    VALUES ($2, 45 + 345, true);
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});
