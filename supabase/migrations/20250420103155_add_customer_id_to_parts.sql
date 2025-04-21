-- Add customer_id column to parts table
alter table public.parts
add column customer_id uuid null;

-- Add foreign key constraint from parts.customer_id to customers.id
alter table public.parts
add constraint parts_customer_id_fkey
foreign key (customer_id)
references public.customers (id)
on delete set null;

-- Optional: Add an index for performance
create index if not exists idx_parts_customer_id on public.parts (customer_id); 