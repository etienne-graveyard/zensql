import { setup } from '@zensql/scripts';
import { SCHEMA } from '../sql/schema';

export default function command(args: Array<string>) {
  setup({
    schema: SCHEMA,
    connectUrl: args[0],
  });
}
