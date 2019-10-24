import * as path from 'path';
import { generateQueries } from '@zensql/generate';

generateQueries({
  source: path.resolve(__dirname, './sql'),
  target: path.resolve(__dirname, './sql.ts'),
});
