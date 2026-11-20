create table order_extra
(
    id            bigint generated always as identity primary key,
    order_id      bigint  not null references customer_order (id),
    ingredient_id bigint  not null references ingredient (id),
    amount        integer not null check (amount > 0),
    constraint order_extra_order_ingredient_uk unique (order_id, ingredient_id)
);
create index order_extra_ingredient_id_idx on order_extra (ingredient_id);