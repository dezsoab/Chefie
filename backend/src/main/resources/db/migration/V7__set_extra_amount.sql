-- Menus
insert into menu (event_id, name, sort_order)
select e.id, v.name, v.sort_order
from event e
         cross join (values ('Classics', 1), ('Specials', 2)) as v(name, sort_order)
where e.name = 'Pizza Party 21.11';

-- Ingredients (stock NULL = unlimited, extra_amount NULL = not an extra)
insert into ingredient (event_id, name, unit, stock, extra_amount)
select e.id, v.name, v.unit, v.stock, v.extra_amount
from event e
         cross join (values ('Dough', 'pcs', 20, null),
                            ('Tomato sauce', 'g', null, null),
                            ('Mozzarella', 'g', 3000, 60),
                            ('Salami', 'slices', 80, 4),
                            ('Ham', 'g', 600, 30),
                            ('Mushrooms', 'g', 500, 30),
                            ('Pineapple', 'g', 400, null),
                            ('Peppers', 'g', 300, null),
                            ('Onion', 'g', 300, null),
                            ('Basil', 'leaves', null, null)) as v(name, unit, stock, extra_amount)
where e.name = 'Pizza Party 21.11';

-- Menu items
insert into menu_item (menu_id, name, description, sort_order)
select m.id, v.name, v.description, v.sort_order
from (values ('Classics', 'Margherita', 'Tomato, mozzarella, basil', 1),
             ('Classics', 'Salami', 'Tomato, mozzarella, salami', 2),
             ('Classics', 'Prosciutto e Funghi', 'Tomato, mozzarella, ham, mushrooms', 3),
             ('Specials', 'Hawaii', 'Tomato, mozzarella, ham, pineapple', 1),
             ('Specials', 'Veggie', 'Tomato, mozzarella, vegetables', 2)) as v(menu, name, description, sort_order)
         join menu m on m.name = v.menu;

-- Recipe lines (amount per pizza, in the ingredient's unit)
insert into recipe_line (menu_item_id, ingredient_id, amount)
select mi.id, i.id, r.amount
from (values ('Margherita', 'Dough', 1),
             ('Margherita', 'Tomato sauce', 80),
             ('Margherita', 'Mozzarella', 120),
             ('Margherita', 'Basil', 3),
             ('Salami', 'Dough', 1),
             ('Salami', 'Tomato sauce', 80),
             ('Salami', 'Mozzarella', 120),
             ('Salami', 'Salami', 8),
             ('Prosciutto e Funghi', 'Dough', 1),
             ('Prosciutto e Funghi', 'Tomato sauce', 80),
             ('Prosciutto e Funghi', 'Mozzarella', 120),
             ('Prosciutto e Funghi', 'Ham', 60),
             ('Prosciutto e Funghi', 'Mushrooms', 50),
             ('Hawaii', 'Dough', 1),
             ('Hawaii', 'Tomato sauce', 80),
             ('Hawaii', 'Mozzarella', 120),
             ('Hawaii', 'Ham', 60),
             ('Hawaii', 'Pineapple', 60),
             ('Veggie', 'Dough', 1),
             ('Veggie', 'Tomato sauce', 80),
             ('Veggie', 'Mozzarella', 120),
             ('Veggie', 'Peppers', 40),
             ('Veggie', 'Onion', 30),
             ('Veggie', 'Mushrooms', 40)) as r(item, ingredient, amount)
         join menu_item mi on mi.name = r.item
         join ingredient i on i.name = r.ingredient;