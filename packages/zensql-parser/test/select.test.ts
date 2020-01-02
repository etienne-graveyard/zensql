import { Parser } from '../src';

const sql = String.raw;

it('parse a simple request', () => {
  expect(Parser.parse(sql`SELECT foo FROM bar`)).toEqual({
    cursor: { column: 19, line: 1 },
    from: {
      cursor: { column: 19, line: 1 },
      tables: [
        {
          cursor: { column: 19, line: 1 },
          schema: null,
          table: {
            cursor: { column: 19, line: 1 },
            originalValue: 'bar',
            type: 'Identifier',
            value: 'bar',
            caseSensitive: false,
          },
          type: 'Table',
        },
      ],
      type: 'FromExpression',
      where: null,
      limit: null,
    },
    columns: [
      {
        column: {
          cursor: { column: 10, line: 1 },
          originalValue: 'foo',
          type: 'Identifier',
          caseSensitive: false,
          value: 'foo',
        },
        cursor: { column: 15, line: 1 },
        schema: null,
        table: null,
        type: 'Column',
      },
    ],
    type: 'Select',
  });
});

it('parse a request with quoted column', () => {
  const result: any = Parser.parse(sql`SELECT foo FROM bar WHERE "foo" = 2`);
  expect(result.from.where.left.column.type).toBe('Identifier');
  expect(result.from.where.left.column.caseSensitive).toBe(true);
});

it('parse a request with a comment after', () => {
  expect(
    Parser.parse(sql`SELECT foo FROM bar;
    -- comment
    `)
  ).toEqual(Parser.parse(sql`SELECT foo FROM bar;`));
});

it('identifier are not case sensitive', () => {
  expect((Parser.parse(sql`SELECT foo FROM BAr;`) as any).from.tables[0].table.value).toEqual(
    'bar'
  );
});

it('identifier are not case sensitive for real', () => {
  expect((Parser.parse(sql`SELECT foo FROM BAR;`) as any).from.tables[0].table.value).toEqual(
    (Parser.parse(sql`SELECT FOO FROM bar;`) as any).from.tables[0].table.value
  );
});

it('does not parse backtick', () => {
  expect(() => Parser.parse('SELECT foo FROM bar WHERE foo = `hey`')).toThrowError(
    'Backtick are not supported'
  );
});

it('parse double quote as column name', () => {
  expect(
    (Parser.parse(sql`SELECT foo FROM bar WHERE foo = "other column"`) as any).from.where.right.type
  ).toEqual('Column');
});

it('parse a request with a named variable', () => {
  expect(
    (Parser.parse(sql`SELECT foo FROM bar WHERE id = :id`) as any).from.where.right.type
  ).toEqual('NamedVariable');
});

it('parse a request with an indexed variable', () => {
  expect(
    (Parser.parse(sql`SELECT foo FROM bar WHERE id = $1`) as any).from.where.right.type
  ).toEqual('IndexedVariable');
});

it('parse escaped single quote', () => {
  expect(() => Parser.parse(sql`SELECT foo FROM bar WHERE foo = 'john''s'`)).not.toThrow();
});

it('parse escaped single quote correctly', () => {
  const parsed: any = Parser.parse(sql`SELECT foo FROM bar WHERE foo = 'john''s'`);
  expect(parsed.from.where.right.value).toEqual(`john's`);
});

describe('parse all sort of queries without error', () => {
  const QUERIES = [
    sql`SELECT Student_ID FROM students;`,
    sql`SELECT * FROM foo WHERE id = :id;`,
    sql`SELECT * FROM foo WHERE id = :fooId2;`,
    sql`SELECT * FROM foo WHERE id = (5 + 6);`,
    sql`SELECT * FROM foo WHERE id = 6 * 6/2 + 75;`,
    sql`SELECT * FROM foo WHERE id = 5;`,
    sql`SELECT * FROM foo WHERE content = 'demo';`,
    sql`SELECT * FROM foo WHERE content = "demo" AND foo = 'bar';`,
    sql`SELECT * FROM My_Schema.Tables;`,
    sql`SELECT * FROM STUDENT;`,
    sql`SELECT * FROM foo WHERE id = 'AZERT';`,
    sql`SELECT * FROM foo WHERE size > 0;`,
    sql`SELECT EMP_ID, NAME FROM EMPLOYEE_TBL WHERE EMP_ID = '0000';`,
    sql`SELECT * FROM foo LEFT JOIN bar ON bar.id = foo.bar_ID;`,
    sql`SELECT * FROM foo AS F LEFT JOIN bar AS B ON B.id = F.bar_ID;`,
  ];

  QUERIES.forEach(q => {
    it(`parse ${q}`, () => {
      expect(() => Parser.parse(q)).not.toThrow();
    });
  });
});

it('parse a LEFT JOIN', () => {
  expect(() =>
    Parser.parse(sql`SELECT foo FROM bar LEFT JOIN boo ON bar.id = boo.bar_id`)
  ).not.toThrowError();
});

it('parse a mulitple LEFT JOIN', () => {
  expect(() =>
    Parser.parse(
      sql`SELECT col1 FROM table1 LEFT JOIN table2 ON table1.id = table2.table1_id LEFT JOIN table3 ON table3.id = table2.table3_id`
    )
  ).not.toThrowError();
});

it('LEFT JOIN output correctly', () => {
  const result: any = Parser.parse(sql`SELECT foo FROM bar LEFT JOIN boo ON bar.id = boo.bar_id`);
  expect(result.from.tables[0].type).toEqual('LeftJoin');
  expect(result.from.tables[0].left.type).toBe('Table');
  expect(result.from.tables[0].right.type).toBe('Table');
});

it('mulitple LEFT JOIN output', () => {
  const parsed: any = Parser.parse(
    sql`SELECT col1 FROM table1 LEFT JOIN table2 ON table1.id = table2.table1_id LEFT JOIN table3 ON table3.id = table2.table3_id`
  );
  expect(parsed.from.tables[0].type).toBe('LeftJoin');
  expect(parsed.from.tables[0].left.type).toBe('LeftJoin');
  expect(parsed.from.tables[0].right.type).toBe('Table');
});
