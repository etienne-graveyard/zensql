export enum CompareOperator {
  NotEqual = 'NotEqual', // <> | !=
  LessOrEqual = 'LessOrEqual', //<=
  GreaterOrEqual = 'GreaterOfEqual', // >=
  Equal = 'Equal', // =
  Less = 'Less', // <
  Greater = 'Greater', // >
}

export enum ValueOperator {
  Plus = 'Plus', // +
  Minus = 'Minus', // -
  Divide = 'Divide', // /
  Multiply = 'Multiply', // *
  Modulo = 'Modulo', // %
}

export enum BooleanOperator {
  And = 'And',
  Or = 'Or',
}

export type Operator = BooleanOperator | CompareOperator | ValueOperator;
