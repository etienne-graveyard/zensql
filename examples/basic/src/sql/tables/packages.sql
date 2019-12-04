CREATE TABLE packages (
  shipment_id INTEGER NOT NULL REFERENCES shipments (id),
  package_number INTEGER NOT NULL,
  contents TEXT NOT NULL,
  weight REAL NOT NULL,
  sender_id INTEGER NOT NULL REFERENCES clients (id),
  recipient_id INTEGER NOT NULL REFERENCES clients (id),
  PRIMARY KEY (shipment_id, package_number),
);

