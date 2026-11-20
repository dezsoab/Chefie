begin;

delete from order_extra
where order_id in (select co.id
                   from customer_order co
                            join event e on e.id = co.event_id
                   where e.status in ('OPEN', 'ON_HOLD'));

delete from customer_order
where event_id in (select id from event where status in ('OPEN', 'ON_HOLD'));

update event
set last_order_number = 0
where status in ('OPEN', 'ON_HOLD');

commit;
