import { generate } from '@zensql/scripts';
import { SCHEMA } from '../sql/schema';
import { QUERIES } from '../sql/queries';
import path from 'path';

export default function command() {
  generate({
    schema: SCHEMA,
    queries: QUERIES,
    target: path.resolve(process.cwd(), 'src/sql.ts'),
  });
}
