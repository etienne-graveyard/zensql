import * as zenslqGenerate from '@zensql/scripts';
export { Tables } from '@zensql/scripts';

export interface Options {
  source: string;
  target: string;
}

export async function command(argv: Array<string>) {
  return zenslqGenerate.command(argv);
}
