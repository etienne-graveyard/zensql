import {
  CreateTableStatement,
  AlterTableStatement,
  NodeIs,
  Node,
  ReferenceTableConstraint,
  ColumnDef,
  TableConstraint,
} from '@zensql/ast';
import * as Builder from '@zensql/builder';
import { TableConstraints } from '@zensql/builder';

export type Schema = Array<CreateTableStatement>;

export type SchemaResolved = {
  tables: Array<CreateTableStatement>;
  constraints: Array<AlterTableStatement>;
};

interface TableResolved {
  table: CreateTableStatement;
  constraints: Array<ReferenceTableConstraint>;
}

export const SchemaUtils = {
  resolve: resolveSchema,
};

function resolveSchema(schema: Schema): SchemaResolved {
  const tablesResolved = schema.map(table => resolveTable(table));

  // No table have the same name
  const namesArr = tablesResolved.map(item => item.table.table.table.value);
  namesArr.forEach(name => {
    if (namesArr.filter(v => v === name).length > 1) {
      throw new Error(`Two tables are named ${name}`);
    }
  });

  const createContraints: Array<AlterTableStatement> = [];

  // Validate Ref and create Alter table statements
  tablesResolved.forEach(table => {
    table.constraints.forEach(constraint => {
      const createContraint: AlterTableStatement = Builder.AlterTable(
        table.table.table.table,
        Builder.AddContraint(
          TableConstraints.ReferenceTableConstraint(constraint.column, constraint.foreignKey)
        )
      );
      createContraints.push(createContraint);
    });
  });

  return {
    constraints: createContraints,
    tables: tablesResolved.map(v => v.table),
  };
}

// Extract Ref constraints
// transform column ref into table ref
function resolveTable(table: CreateTableStatement): TableResolved {
  const constraints: Array<ReferenceTableConstraint> = [];

  const tableWithoutRefContraints: CreateTableStatement = {
    ...table,
    items: table.items
      .filter(colDef => {
        if (NodeIs.ColumnDef(colDef)) {
          return true;
        }
        if (NodeIs.PrimaryKeyTableConstraint(colDef)) {
          return true;
        }
        if (NodeIs.ReferenceTableConstraint(colDef)) {
          // make sure the column the ref is on exist
          const column = table.items.find(item => {
            return NodeIs.ColumnDef(item) && item.name.value === colDef.column.value;
          });
          if (!column) {
            throw new Error(
              `Error in table ${table.table.table.value}: column ${colDef.column.value} does not exist`
            );
          }
          constraints.push(colDef);
          return false;
        }
        throw new Error(`Unexpected node ${(colDef as any).type}`);
      })
      .map((colDef): ColumnDef | TableConstraint => {
        if (NodeIs.ColumnDef(colDef)) {
          const hasRef = colDef.constraints.some(constraint =>
            NodeIs.ReferenceConstraint(constraint)
          );
          if (hasRef === false) {
            return colDef;
          }
          return {
            ...colDef,
            constraints: colDef.constraints.filter(constraint => {
              if (NodeIs.ReferenceConstraint(constraint)) {
                const tableConstraint = Node.create('ReferenceTableConstraint', {
                  column: colDef.name,
                  foreignKey: constraint.foreignKey,
                });
                constraints.push(tableConstraint);
                return false;
              }
              return true;
            }),
          };
        }
        return colDef;
      }),
  };

  return {
    constraints,
    table: tableWithoutRefContraints,
  };
}
