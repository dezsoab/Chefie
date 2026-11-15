alter table event
    add column last_order_number integer not null default 0;

create table customer_order
(
    id           bigint generated always as identity primary key,
    event_id     bigint      not null references event (id),
    menu_item_id bigint      not null references menu_item (id),
    number       integer     not null,
    guest_name   text        not null,
    note         text,
    status       text        not null default 'QUEUED',
    guest_token  UUID        not null,
    created_at   timestamptz not null default now(),
    cooking_at   timestamptz,
    ready_at     timestamptz,
    picked_up_at timestamptz,

    constraint customer_order_status_check check ( status in ('QUEUED', 'COOKING', 'READY', 'PICKED_UP', 'CANCELLED') ),
    constraint customer_order_event_number_uk unique (event_id, number)
);
create index customer_order_menu_item_id_idx on customer_order (menu_item_id);