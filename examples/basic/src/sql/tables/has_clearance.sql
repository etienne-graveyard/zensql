CREATE TABLE has_clearance (
  employee_id UUID NOT NULL REFERENCES employees (id),
  planet_id UUID NOT NULL REFERENCES planets (id),
  level INTEGER NOT NULL,
  PRIMARY KEY (employee_id, planet_id)
);

