alter table event drop constraint event_status_check;
alter table event add constraint event_status_check check (status in ('DRAFT', 'ON_HOLD', 'OPEN', 'CLOSED'));
