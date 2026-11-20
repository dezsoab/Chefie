alter table customer_order add column item_name text;

update customer_order co
set item_name = mi.name
from menu_item mi
where mi.id = co.menu_item_id;

alter table customer_order alter column item_name set not null;
alter table customer_order alter column menu_item_id drop not null;

alter table customer_order drop constraint customer_order_menu_item_id_fkey;
alter table customer_order
    add constraint customer_order_menu_item_id_fkey
        foreign key (menu_item_id) references menu_item (id) on delete set null;

alter table order_extra drop constraint order_extra_ingredient_id_fkey;
alter table order_extra
    add constraint order_extra_ingredient_id_fkey
        foreign key (ingredient_id) references ingredient (id) on delete cascade;
