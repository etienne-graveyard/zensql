CREATE TABLE shipments (
  id UUID PRIMARY KEY,
  date DATE,
  manager UUID NOT NULL REFERENCES employees (id),
  planet UUID NOT NULL REFERENCES planets (id)
);

