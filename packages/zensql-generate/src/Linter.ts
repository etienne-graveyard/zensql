import { Node, NodeIs } from '@zensql/parser';

export const Linter = {
  lint,
};

function lint(node: Node): void {
  lintInternal(node);
}

function lintInternal(node: Node): void {
  if (NodeIs.CreateTableStatement(node)) {
    console.log(node.table.table.value);
  }
}
