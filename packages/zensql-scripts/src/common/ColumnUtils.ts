import {
  DataType,
  NodeIs,
  SelectColumns,
  SelectColumnsItem,
  Identifier,
  ColumnDef,
  Column,
  ColumnAlias,
} from '@zensql/ast';
import { TableResolved } from './TableUtils';

export const ColumnUtils = {
  resolveSingle,
  findAll,
  resolveSelectColumns,
  resolveOnTable,
};

export interface ColumnResolved {
  table: string;
  column: string;
  tableAlias: string | null;
  alias: string | null;
  type: ColumnType;
}

export interface ColumnType {
  dt: DataType;
  nullable: boolean;
}

function resolveColumn(table: TableResolved, col: ColumnDef): ColumnResolved {
  return {
    column: col.name.value,
    table: table.table,
    tableAlias: table.alias,
    alias: null,
    type: {
      dt: col.dataType,
      // TODO:
      nullable: false,
    },
  };
}

function findAll(tables: Array<TableResolved>): Array<ColumnResolved> {
  const allColumns: Array<ColumnResolved> = [];
  tables.forEach(table => {
    table.columns.forEach(col => {
      // TODO: make sure each column is unique
      allColumns.push(resolveColumn(table, col));
    });
  });
  return allColumns;
}

function resolveOnTable(
  table: TableResolved,
  columns: Array<Identifier> | null
): Array<ColumnResolved> {
  if (columns === null) {
    return table.columns.map(col => resolveColumn(table, col));
  }
  return columns.map(column => {
    const col = table.columns.find(c => c.name.value === column.value);
    if (!col) {
      throw new Error(`Cannot find column ${column.value}`);
    }
    return resolveColumn(table, col);
  });
}

function resolveSingle(
  column: Column | ColumnAlias,
  allColumns: Array<ColumnResolved>
): ColumnResolved {
  const colStr = `${column.schema ? column.schema.value + '.' : ''}${
    column.table ? column.table.value + '.' : ''
  }${column.column.value}`;
  const matchCols = allColumns.filter(col => {
    const match =
      (column.table ? column.table.value === col.table : true) &&
      column.column.value === col.column;
    const matchAlias =
      column.table && column.table.value === col.tableAlias && column.column.value === col.column;
    if (!matchAlias && match && col.tableAlias && column.table) {
      throw new Error(`Invalid column ${colStr}, the table is aliased as ${col.tableAlias}`);
    }
    return match || matchAlias;
  });
  if (matchCols.length === 0) {
    throw new Error(`Invalid column ${colStr}, Cannot find column !`);
  }
  if (matchCols.length > 1) {
    throw new Error(`Invalid column ${colStr}, match more than one column !`);
  }
  const col = matchCols[0];
  return {
    ...col,
    alias: NodeIs.ColumnAlias(column) ? column.alias.value : null,
  };
}

function resolveSelectColumns(
  tables: Array<TableResolved>,
  allColumns: Array<ColumnResolved>,
  select: SelectColumns
): Array<ColumnResolved> {
  return select
    .map(sel => resolveSelectColumn(tables, allColumns, sel))
    .reduce<Array<ColumnResolved>>((acc, val) => {
      acc.push(...val);
      return acc;
    }, []);
}

function resolveSelectColumn(
  tables: Array<TableResolved>,
  allColumns: Array<ColumnResolved>,
  select: SelectColumnsItem
): Array<ColumnResolved> {
  if (select.type === 'ColumnAll') {
    return allColumns;
  }
  if (NodeIs.ColumnAllFromTable(select)) {
    const selectStr = `${select.schema ? select.schema.value + '.' : ''}${select.table.value}.*`;
    const matchTables = tables.filter(table => {
      const matchAlias = table.alias ? select.table.value === table.alias : false;
      const match = select.table.value === table.table;
      if (match && table.alias) {
        throw new Error(`Invalid column ${selectStr}, the table is aliased as ${table.alias}`);
      }
      return match || matchAlias;
    });
    if (matchTables.length === 0) {
      throw new Error(`Invalid column ${selectStr}, Cannot find table !`);
    }
    if (matchTables.length > 1) {
      throw new Error(`Invalid column ${selectStr}, match more than one table !`);
    }
    const table = matchTables[0];
    const cols: Array<ColumnResolved> = [];
    table.columns.forEach(col => {
      cols.push({
        column: col.name.value,
        table: table.table,
        tableAlias: null,
        alias: null,
        type: {
          dt: col.dataType,
          // TODO:
          nullable: false,
        },
      });
    });
    return cols;
  }
  if (NodeIs.Column(select) || NodeIs.ColumnAlias(select)) {
    return [resolveSingle(select, allColumns)];
  }
  console.warn(`Unhandled type ${(select as any).type}`);
  return [];
}
