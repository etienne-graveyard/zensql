import * as path from 'path';
import { runCommand } from '@zensql/generate';

runCommand({
  source: path.resolve(__dirname, './sql'),
  target: path.resolve(__dirname, './sql.ts'),
});
