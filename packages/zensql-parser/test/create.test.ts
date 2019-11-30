import { Parser } from '../src';

it('parse a query', () => {
  const QUERY = `
    CREATE TABLE documents (
      id uuid PRIMARY KEY
    );
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});

it('parse a query with primary key', () => {
  const QUERY = `
    CREATE TABLE public.documents (
      id text PRIMARY KEY
    )
  `;
  const parsed: any = Parser.parse(QUERY);
  expect(parsed.columns[0].constraints[0].type).toEqual('PrimaryKeyConstraint');
});

it.skip('parse a query with a reference', () => {
  const QUERY = `
    CREATE TABLE versions (
      id uuid NOT NULL,
      created timestamptz NOT NULL,
      document_id uuid NOT NULL REFERENCES documents (id),
      content json NOT NULL
    );
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});
