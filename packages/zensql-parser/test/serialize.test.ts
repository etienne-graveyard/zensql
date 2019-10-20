import { Parser, Serializer } from '../src';

it('parse and serialize a simple request', () => {
  expect(Serializer.serialize(Parser.parse(`SELECT foo FROM bar;`))).toEqual('SELECT foo FROM bar;');
});

describe('parse and serialize all sort of queries without error with same result', () => {
  const QUERIES = [
    `SELECT student_id FROM students;`,
    `SELECT * FROM foo WHERE id = :id;`,
    `SELECT * FROM foo WHERE id = :fooId2;`,
    `SELECT * FROM foo WHERE id = 5 + 6;`,
    `SELECT * FROM foo WHERE id = 6 * 6 / 2 + 75;`,
    `SELECT * FROM foo WHERE id = 6 * 6 / (2 + 75);`,
    `SELECT * FROM foo WHERE id = 5;`,
    `SELECT * FROM my_schema.tables;`,
    `SELECT * FROM student;`,
    `SELECT * FROM foo WHERE id = "AZERT";`,
    `SELECT * FROM foo WHERE size > 0;`,
    `SELECT emp_id, name FROM employee_tbl WHERE emp_id = "0000";`,
    `SELECT foo FROM bar LEFT JOIN boo ON bar.id = boo.bar_id;`,
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
  expect(Serializer.serialize(Parser.parse(`SELECT * FROM foo WHERE (id = ((6 * 6) / (2 + 75)));`))).toEqual(
    'SELECT * FROM foo WHERE id = 6 * 6 / (2 + 75);'
  );
});
