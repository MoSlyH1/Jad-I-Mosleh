-- Messages sent through the contact form.
-- The app also creates this table automatically on first use.
CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120)  NOT NULL,
  email      VARCHAR(200)  NOT NULL,
  message    TEXT          NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
