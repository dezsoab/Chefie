create table menu
(
    id          bigint generated always as identity primary key,
    event_id    bigint  not null references event (id),
    name        text    not null,
    description text,
    sort_order  integer not null default 0
);
create index menu_event_id_idx on menu (event_id);