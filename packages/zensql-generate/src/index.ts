import path from 'path';
import { DatabaseSchema } from './DatabaseSchema';
import { Query } from './Query';
import { Printer } from './Printer';

export { DatabaseDefinition } from './DatabaseSchema';

type Command = 'generate' | 'setup';

export function resolveCommand(argv: Array<string>): [Command, Array<string>] {
  if (argv[2] === 'setup') {
    return ['setup', argv.slice(3)];
  }
  if (argv[2] === 'generate') {
    return ['generate', argv.slice(3)];
  }
  return ['generate', argv.slice(2)];
}

export interface GenerateOptions {
  source: string;
  target: string;
  importFrom?: string;
}

export function resolveGenerateOptions(argv: Array<string>): GenerateOptions {
  const source = path.resolve(process.cwd(), argv[0]);
  const target = path.resolve(process.cwd(), argv[1]);
  // TODO: validate options
  return { source, target };
}

export interface SetupOptions {
  connectUrl: string;
}

export function resolveSetupOptions(argv: Array<string>): SetupOptions {
  const connectUrl = argv[0];
  // TODO: validate options
  return { connectUrl };
}

export async function command(argv: Array<string>) {
  try {
    const [command, args] = resolveCommand(argv);
    if (command === 'generate') {
      return await runGenerateCommand(resolveGenerateOptions(args));
    }
    return runSetupCommand(resolveSetupOptions(args));
  } catch (error) {
    console.log('Something bad happened');
    console.error(error);
  }
}

export async function runGenerateCommand(options: GenerateOptions) {
  const { source, target, importFrom = '@zensql/parser' } = options;

  const SQL_TABLES_FOLDER = path.resolve(source, 'tables');
  const SQL_QUERIES_FOLDER = path.resolve(source, 'queries');
  const OUTPUT_QUERIES_FILE = path.resolve(target);

  const schema = await DatabaseSchema.parse(SQL_TABLES_FOLDER);
  const queries = (await Query.find(SQL_QUERIES_FOLDER)).map(queryPath => {
    return Query.resolve(schema, queryPath);
  });
  await Printer.print({
    targetPath: OUTPUT_QUERIES_FILE,
    schema,
    queries,
    importFrom,
  });
}

export function runSetupCommand(options: SetupOptions) {
  const { connectUrl } = options;
  console.log('todo', connectUrl);
}
