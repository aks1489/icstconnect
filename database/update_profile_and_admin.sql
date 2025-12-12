-- 1. Add new profile columns
alter table public.profiles
add column if not exists phone text,
add column if not exists post_office text,
add column if not exists enrollment_center text;

-- 2. Create a function to allow Admins to delete users
-- This is required because client-side cannot delete from auth.users directly
create or replace function delete_user_by_id(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Check if executing user is admin (optional safety check)
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access denied. Only admins can delete users.';
  end if;

  -- Delete from auth.users (cascade will handle profiles)
  delete from auth.users where id = user_id;
end;
$$;
