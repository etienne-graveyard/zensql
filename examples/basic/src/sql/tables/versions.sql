CREATE TABLE versions (
  id uuid PRIMARY KEY,
  created timestamptz NOT NULL,
  resources_id uuid NOT NULL REFERENCES resources (id),
  mutations json NOT NULL,
  content json NOT NULL
);

