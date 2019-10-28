import * as zenslqGenerate from '@zensql/generate';
export { DatabaseDefinition } from '@zensql/generate';

export interface Options {
  source: string;
  target: string;
}

export async function command(argv: Array<string>) {
  try {
    const options = zenslqGenerate.resolveArgv(argv);
    await runCommand(options);
  } catch (error) {
    console.log('Something bad happened');
    console.error(error);
  }
}

export async function runCommand(options: Options) {
  const { source, target } = options;
  await zenslqGenerate.runCommand({
    source,
    target,
    importFrom: 'zensql',
  });
}
