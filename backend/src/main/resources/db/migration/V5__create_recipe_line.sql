create table recipe_line
(
    menu_item_id  bigint  not null references menu_item (id) on delete cascade,
    ingredient_id bigint  not null references ingredient (id),
    amount        integer not null default 1,
    constraint recipe_amount_check check (amount > 0),
    primary key (menu_item_id, ingredient_id)
);
create index recipe_line_ingredient_id_idx on recipe_line (ingredient_id);