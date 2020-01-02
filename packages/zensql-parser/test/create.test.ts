import { Parser } from '../src';

const sql = String.raw;

it('parse a query', () => {
  const QUERY = sql`
    CREATE TABLE documents (
      id uuid PRIMARY KEY
    );
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});

it('parse a query with primary key', () => {
  const QUERY = sql`
    CREATE TABLE public.documents (
      id text PRIMARY KEY
    )
  `;
  const parsed: any = Parser.parse(QUERY) as any;
  expect(parsed.items[0].constraints[0].type).toEqual('PrimaryKeyConstraint');
});

it('parse a query with a reference', () => {
  const QUERY = sql`
    CREATE TABLE versions (
      id uuid PRIMARY KEY,
      created timestamptz NOT NULL,
      document_id uuid NOT NULL REFERENCES documents (id),
      content json NOT NULL
    );
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
});

it('parse datatypes correctly', () => {
  const QUERY = sql`
    CREATE TABLE versions (
      id uuid PRIMARY KEY,
      created timestamptz NOT NULL,
      document_id uuid NOT NULL REFERENCES documents (id),
      content json NOT NULL,
      infos char(255)
    );
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
  const parsed: any = Parser.parse(QUERY);
  expect(parsed.items[2].dataType.dt.type).toEqual('UUID');
  expect(parsed.items[4].dataType.dt.type).toEqual('CHAR');
  expect(parsed.items[4].dataType.dt.param).toEqual(255);
});

it('parse a query with table constraint', () => {
  const QUERY = sql`
    CREATE TABLE has_clearance (
      employee_id UUID NOT NULL,
      planet_id UUID NOT NULL,
      PRIMARY KEY (employee_id, planet_id)
    );
  `;
  expect(() => Parser.parse(QUERY)).not.toThrow();
  const parsed: any = Parser.parse(QUERY);
  expect(parsed.items[2].type).toEqual('PrimaryKeyTableConstraint');
  expect(parsed.items[2].columns.map((c: any) => c.value)).toEqual(['employee_id', 'planet_id']);
});
