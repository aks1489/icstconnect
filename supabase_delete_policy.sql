-- POLICY: Enable delete for authenticated users
-- This policy allows logged-in admin users to delete records from the discount_inquiries table.

create policy "Enable delete for authenticated users"
on "public"."discount_inquiries"
as permissive
for delete
to authenticated
using (true);
