export interface SetupOptions {
  connectUrl: string;
}

export function resolveSetupOptions(argv: Array<string>): SetupOptions {
  const connectUrl = argv[0];
  if (connectUrl === undefined) {
    throw new Error(`setup command require a connectUrl option`);
  }
  return { connectUrl };
}

export async function runSetupCommand(options: SetupOptions) {
  const { connectUrl } = options;
  console.log('todo', { connectUrl });
}
