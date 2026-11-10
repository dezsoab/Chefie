CREATE TABLE event (
                       id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       name        TEXT        NOT NULL,
                       status      TEXT        NOT NULL DEFAULT 'DRAFT',
                       created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                       CONSTRAINT event_status_check CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED'))
);