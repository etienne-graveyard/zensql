import { Parser } from '../src';

it('parse a simple request', () => {
  expect(Parser.parse(`SELECT foo FROM bar`)).toEqual({
    from: {
      tables: [
        {
          schema: null,
          table: {
            type: 'Identifier',
            value: 'bar',
          },
          type: 'Table',
        },
      ],
      type: 'FromExpression',
      where: null,
    },
    select: [
      {
        column: {
          type: 'Identifier',
          value: 'foo',
        },
        schema: null,
        table: null,
        type: 'Column',
      },
    ],
    type: 'SelectStatement',
  });
});

it('parse a request with quoted column', () => {
  expect(Parser.parse(`SELECT foo FROM bar WHERE "foo" = 2`)).toEqual({
    type: 'SelectStatement',
    from: {
      type: 'FromExpression',
      tables: [
        {
          type: 'Table',
          schema: null,
          table: { type: 'Identifier', value: 'bar' },
        },
      ],
      where: {
        type: 'CompareOperation',
        left: {
          type: 'Column',
          column: { type: 'CaseSensitiveIdentifier', value: 'foo' },
          schema: null,
          table: null,
        },
        operator: 'Equal',
        right: { type: 'Numeric', value: 2 },
      },
    },
    select: [
      {
        type: 'Column',
        column: { type: 'Identifier', value: 'foo' },
        schema: null,
        table: null,
      },
    ],
  });
});

it('parse a request with a comment after', () => {
  expect(
    Parser.parse(`SELECT foo FROM bar;
    -- comment`)
  ).toEqual({
    from: {
      type: 'FromExpression',
      tables: [{ schema: null, table: { type: 'Identifier', value: 'bar' }, type: 'Table' }],
      where: null,
    },
    select: [{ column: { type: 'Identifier', value: 'foo' }, schema: null, table: null, type: 'Column' }],
    type: 'SelectStatement',
  });
});

it('identifier are not case sensitive', () => {
  expect(Parser.parse(`SELECT foo FROM BAr;`)).toEqual({
    from: {
      tables: [{ schema: null, table: { type: 'Identifier', value: 'bar' }, type: 'Table' }],
      type: 'FromExpression',
      where: null,
    },
    select: [{ column: { type: 'Identifier', value: 'foo' }, schema: null, table: null, type: 'Column' }],
    type: 'SelectStatement',
  });
});

it('identifier are not case sensitive for real', () => {
  expect(Parser.parse(`SELECT foo FROM BAR;`)).toEqual(Parser.parse(`SELECT FOO FROM bar;`));
});

it('does not parse backtick', () => {
  expect(() => Parser.parse('SELECT foo FROM bar WHERE foo = `hey`')).toThrowError();
});

it('parse double quote as column name', () => {
  expect(Parser.parse(`SELECT foo FROM bar WHERE foo = "other column"`)).toEqual({
    type: 'SelectStatement',
    from: {
      type: 'FromExpression',
      tables: [{ schema: null, table: { type: 'Identifier', value: 'bar' }, type: 'Table' }],
      where: {
        type: 'CompareOperation',
        left: { column: { type: 'Identifier', value: 'foo' }, schema: null, table: null, type: 'Column' },
        operator: 'Equal',
        right: {
          column: { type: 'CaseSensitiveIdentifier', value: 'other column' },
          schema: null,
          table: null,
          type: 'Column',
        },
      },
    },
    select: [{ column: { type: 'Identifier', value: 'foo' }, schema: null, table: null, type: 'Column' }],
  });
});

it('parse a request with a named variable', () => {
  expect(Parser.parse(`SELECT foo FROM bar WHERE id = :id`)).toEqual({
    type: 'SelectStatement',
    from: {
      type: 'FromExpression',
      tables: [{ schema: null, table: { type: 'Identifier', value: 'bar' }, type: 'Table' }],
      where: {
        type: 'CompareOperation',
        left: { column: { type: 'Identifier', value: 'id' }, schema: null, table: null, type: 'Column' },
        operator: 'Equal',
        right: { name: 'id', type: 'NamedVariable' },
      },
    },
    select: [{ column: { type: 'Identifier', value: 'foo' }, schema: null, table: null, type: 'Column' }],
  });
});

it('parse a request with an indexed variable', () => {
  expect(Parser.parse(`SELECT foo FROM bar WHERE id = $1`)).toEqual({
    type: 'SelectStatement',
    from: {
      type: 'FromExpression',
      tables: [{ schema: null, table: { type: 'Identifier', value: 'bar' }, type: 'Table' }],
      where: {
        type: 'CompareOperation',
        left: { type: 'Column', column: { type: 'Identifier', value: 'id' }, schema: null, table: null },
        operator: 'Equal',
        right: { num: 1, type: 'IndexedVariable' },
      },
    },
    select: [{ column: { type: 'Identifier', value: 'foo' }, schema: null, table: null, type: 'Column' }],
  });
});

describe('parse all sort of queries without error', () => {
  const QUERIES = [
    `SELECT Student_ID FROM students;`,
    `SELECT * FROM foo WHERE id = :id;`,
    `SELECT * FROM foo WHERE id = :fooId2;`,
    `SELECT * FROM foo WHERE id = (5 + 6);`,
    `SELECT * FROM foo WHERE id = 6 * 6/2 + 75;`,
    `SELECT * FROM foo WHERE id = 5;`,
    `SELECT * FROM foo WHERE content = 'demo';`,
    `SELECT * FROM foo WHERE content = "demo" AND foo = 'bar';`,
    `SELECT * FROM My_Schema.Tables;`,
    `SELECT * FROM STUDENT;`,
    `SELECT * FROM foo WHERE id = 'AZERT';`,
    `SELECT * FROM foo WHERE size > 0;`,
    `SELECT EMP_ID, NAME FROM EMPLOYEE_TBL WHERE EMP_ID = '0000';`,
  ];

  QUERIES.forEach(q => {
    it(`parse ${q}`, () => {
      expect(() => Parser.parse(q)).not.toThrow();
    });
  });
});

it('parse a LEFT JOIN', () => {
  expect(() => Parser.parse('SELECT foo FROM bar LEFT JOIN boo ON bar.id = boo.bar_id')).not.toThrowError();
});
