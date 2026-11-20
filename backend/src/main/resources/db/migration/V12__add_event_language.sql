alter table event add column language text not null default 'en';
alter table event add constraint event_language_check check (language in ('en', 'de', 'hu'));
