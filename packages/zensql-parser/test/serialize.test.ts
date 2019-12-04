import { Parser, Serializer } from '../src';

const sql = String.raw;

it('parse and serialize a simple request', () => {
  expect(Serializer.serialize(Parser.parse(sql`SELECT foo FROM bar;`))).toEqual(sql`SELECT foo FROM bar;`);
});

describe('parse and serialize all sort of queries without error with same result', () => {
  const QUERIES = [
    sql`SELECT student_id FROM students;`,
    sql`SELECT * FROM foo WHERE id = :id;`,
    sql`SELECT * FROM foo WHERE id = :fooId2;`,
    sql`SELECT * FROM foo WHERE id = 5 + 6;`,
    sql`SELECT * FROM foo WHERE id = 6 * 6 / 2 + 75;`,
    sql`SELECT * FROM foo WHERE id = 6 * 6 / (2 + 75);`,
    sql`SELECT * FROM foo WHERE id = 5;`,
    sql`SELECT * FROM my_schema.tables;`,
    sql`SELECT * FROM student;`,
    sql`SELECT * FROM foo WHERE id = "AZERT";`,
    sql`SELECT * FROM foo WHERE size > 0;`,
    sql`SELECT emp_id, name FROM employee_tbl WHERE emp_id = "0000";`,
    sql`SELECT foo FROM bar LEFT JOIN boo ON bar.id = boo.bar_id;`,
    sql`CREATE TABLE public.documents (id TEXT);`,
    sql`CREATE TABLE public.documents (id UUID PRIMARY KEY, name TEXT NOT NULL);`,
    sql`CREATE TABLE public.documents (id UUID PRIMARY KEY, other_id UUID REFERENCES other (id));`,
    sql`INSERT INTO some_table (column1, column2, column3) VALUES (:var, 45, 56);`,
    sql`INSERT INTO some_table (column1, column2, column3) VALUES (:var, 45, 56), (:var, 45, 56);`,
    sql`INSERT INTO some_table VALUES (:var, 45, 56), (:var, 45, 56);`,
  ];

  QUERIES.forEach(q => {
    it(`parse & serialize ${q}`, () => {
      const parsed = Parser.parse(q);
      expect(() => Serializer.serialize(parsed)).not.toThrow();
      expect(Serializer.serialize(parsed)).toEqual(q);
    });
  });
});

it('remove unecessary parentheses', () => {
  expect(Serializer.serialize(Parser.parse(sql`SELECT * FROM foo WHERE (id = ((6 * 6) / (2 + 75)));`))).toEqual(
    sql`SELECT * FROM foo WHERE id = 6 * 6 / (2 + 75);`
  );
});
