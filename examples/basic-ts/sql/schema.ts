import {
  ColumnConstraint,
  DataType,
  CreateTable,
  ColumnDef,
  TableConstraints,
  Column,
} from '@zensql/builder';

const NotNull = ColumnConstraint.NotNull();
const Primary = ColumnConstraint.PrimaryKey();
const UUID = DataType.UUID();
const TEXT = DataType.TEXT();
const INTEGER = DataType.INTEGER();
const Ref = ColumnConstraint.References;

const clients = CreateTable('clients', [
  // id INTEGER PRIMARY KEY,
  ColumnDef('id', UUID, Primary),
  ColumnDef('name', TEXT, NotNull),
]);

const employees = CreateTable('employees', [
  ColumnDef('id', UUID, Primary),
  ColumnDef('name', TEXT, NotNull),
  ColumnDef('position', TEXT, NotNull),
  ColumnDef('salary', DataType.REAL(), NotNull),
  ColumnDef('remarks', TEXT),
]);

const hasClearance = CreateTable('has_clearance', [
  ColumnDef('employee_id', UUID, NotNull, Ref('employees', 'id')),
  ColumnDef('planet_id', UUID, NotNull, Ref('planets', 'id')),
  ColumnDef('level', INTEGER, NotNull),
  TableConstraints.PrimaryKey('employee_id', 'planet_id'),
]);

const packages = CreateTable('packages', [
  ColumnDef('shipment_id', UUID, NotNull, Ref('shipments', 'id')),
  ColumnDef('package_number', INTEGER, NotNull),
  ColumnDef('contents', TEXT, NotNull),
  ColumnDef('weight', DataType.REAL(), NotNull),
  ColumnDef('sender_id', UUID, NotNull, Ref('clients', 'id')),
  ColumnDef('recipient_id', UUID, NotNull, Ref('clients', 'id')),
  TableConstraints.PrimaryKey('shipment_id', 'package_number'),
]);

const planets = CreateTable('planets', [
  ColumnDef('id', UUID, Primary),
  ColumnDef('name', TEXT, NotNull),
]);

const shipments = CreateTable('shipments', [
  ColumnDef('id', UUID, Primary),
  ColumnDef('date', DataType.DATE()),
  ColumnDef('manager', UUID, NotNull),
  ColumnDef('planet', UUID, NotNull, Ref('planets', 'id')),
  TableConstraints.ReferenceTableConstraint('manager', Column('employees', 'id')),
]);

export const SCHEMA = [clients, employees, hasClearance, packages, planets, shipments];
