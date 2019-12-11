import { InsertIntoStatement, Select } from '@zensql/ast';
import { Printer } from './Printer';
import { Query, QueryResolved } from './Query';
import { Schema } from '../common/SchemaUtils';

export interface GenerateOptions {
  target: string;
  schema: Schema;
  queries: { [key: string]: Select | InsertIntoStatement };
}

export async function generate(options: GenerateOptions) {
  const { target, queries, schema } = options;

  console.log({
    target,
    queries,
    schema,
  });

  const resolvedQueries: Array<QueryResolved> = Object.keys(queries).map(name => {
    return Query.resolve(schema, name, queries[name]);
  });

  await Printer.print({
    targetPath: target,
    queries: resolvedQueries,
  });
}
