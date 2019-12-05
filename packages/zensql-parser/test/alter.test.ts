import { Parser } from '../src';

const sql = String.raw;

test('parse a query', () => {
  const QUERY = sql`ALTER TABLE documents ADD CONSTRAINT user_id REFERENCES users (id)`;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});
