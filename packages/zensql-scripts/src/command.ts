import { runGenerateCommand, resolveGenerateOptions } from './generate';
import { runSetupCommand, resolveSetupOptions } from './setup';

type Command = 'generate' | 'setup';

export function resolveCommand(argv: Array<string>): { command: Command; args: Array<string> } {
  if (argv[2] === 'setup') {
    return { command: 'setup', args: argv.slice(3) };
  }
  if (argv[2] === 'generate') {
    return { command: 'generate', args: argv.slice(3) };
  }
  return { command: 'generate', args: argv.slice(2) };
}

export interface GlobalOptions {
  importFrom?: string;
}

export async function command(argv: Array<string>, options: GlobalOptions = {}) {
  try {
    const info = resolveCommand(argv);
    if (info.command === 'generate') {
      const generateOptions = await resolveGenerateOptions(options);
      return runGenerateCommand(generateOptions);
    }
    if (info.command === 'setup') {
      const setupOptions = await resolveSetupOptions(info.args);
      return runSetupCommand(setupOptions);
    }
    return;
  } catch (error) {
    console.log('Something bad happened');
    console.error(error);
    return;
  }
}
