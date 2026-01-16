-- POLICY: Enable delete for admin users only
-- This policy allows ONLY logged-in admin users to delete records from the discount_inquiries table.

create policy "Enable delete for admin users only"
on "public"."discount_inquiries"
as permissive
for delete
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
