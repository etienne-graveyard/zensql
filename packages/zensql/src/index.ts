import * as zenslqGenerate from '@zensql/generate';
export { DatabaseDefinition } from '@zensql/generate';

export interface Options {
  source: string;
  target: string;
}

export async function command(argv: Array<string>) {
  return zenslqGenerate.command(argv, { importFrom: 'zensql' });
}
