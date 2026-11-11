create table ingredient
(
    id           bigint generated always as identity primary key,
    event_id     bigint not null references event (id),
    name         text   not null,
    version      bigint not null default 0,
    stock        integer         default 0,
    unit         text   not null,
    extra_amount integer,
    constraint ingredient_stock_check check ( stock >= 0),
    constraint ingredient_extra_amount_check check ( extra_amount > 0 )
);
create index ingredient_event_id_idx on ingredient (event_id);