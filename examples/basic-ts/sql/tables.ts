import { Builder } from '@zensql/builder';

const { TYPES, CREATE_TABLE } = Builder;
const { COLUMN, CONSTRAINT: TABLE_CONSTRAINT } = CREATE_TABLE;
const { CONSTRAINT } = COLUMN;

const NOT_NULL = CONSTRAINT.NOT_NULL();
const PRIMARY = CONSTRAINT.PRIMARY_KEY();
const UUID = TYPES.UUID();
const TEXT = TYPES.TEXT();
const INTEGER = TYPES.INTEGER();
const COL = COLUMN.create;

const clients = CREATE_TABLE.create('clients', [
  // id INTEGER PRIMARY KEY,
  COL('id', UUID, PRIMARY),
  COL('name', TEXT, NOT_NULL),
]);

const employees = CREATE_TABLE.create('employees', [
  COL('id', UUID, PRIMARY),
  COL('name', TEXT, NOT_NULL),
  COL('position', TEXT, NOT_NULL),
  COL('salary', TYPES.REAL(), NOT_NULL),
  COL('remarks', TEXT),
]);

const hasClearance = CREATE_TABLE.create('has_clearance', [
  COL('employee_id', UUID, NOT_NULL, CONSTRAINT.REFERENCES('employees', 'id')),
  COL('planet_id', UUID, NOT_NULL, CONSTRAINT.REFERENCES('planets', 'id')),
  COL('level', INTEGER, NOT_NULL),
  TABLE_CONSTRAINT.PRIMARY_KEY('employee_id', 'planet_id'),
]);

const packages = CREATE_TABLE.create('packages', [
  COL('shipment_id', UUID, NOT_NULL, CONSTRAINT.REFERENCES('shipments', 'id')),
  COL('package_number', INTEGER, NOT_NULL),
  COL('contents', TEXT, NOT_NULL),
  COL('weight', TYPES.REAL(), NOT_NULL),
  COL('sender_id', UUID, NOT_NULL, CONSTRAINT.REFERENCES('clients', 'id')),
  COL('recipient_id', UUID, NOT_NULL, CONSTRAINT.REFERENCES('clients', 'id')),
  TABLE_CONSTRAINT.PRIMARY_KEY('shipment_id', 'package_number'),
]);

const planets = CREATE_TABLE.create('planets', [
  COL('id', UUID, PRIMARY),
  COL('name', TEXT, NOT_NULL),
]);

const shipments = CREATE_TABLE.create('shipments', [
  COL('id', UUID, PRIMARY),
  COL('date', TYPES.DATE()),
  COL('manager', UUID, NOT_NULL, CONSTRAINT.REFERENCES('employees', 'id')),
  COL('planet', UUID, NOT_NULL, CONSTRAINT.REFERENCES('planets', 'id')),
]);

export const DATABASE = [clients, employees, hasClearance, packages, planets, shipments];
