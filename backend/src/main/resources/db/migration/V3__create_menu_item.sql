create table menu_item
(
    id          bigint generated always as identity primary key,
    menu_id     bigint  not null references menu (id),
    name        text    not null,
    description text,
    sort_order  integer not null default 0,
    enabled     boolean not null default true
);
create index menu_item_menu_id_idx on menu_item (menu_id);