-- Portal INKAI Jatim - link member profile to Branch

alter table public.portal_member_profiles
  add column if not exists branch_id uuid,
  add column if not exists branch_name text;

create or replace function public.handle_new_portal_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.portal_member_profiles (
    user_id,
    full_name,
    member_id,
    dojo_name,
    branch_id,
    branch_name
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'member_id', ''),
    nullif(new.raw_user_meta_data->>'dojo_name', ''),
    nullif(new.raw_user_meta_data->>'branch_id', '')::uuid,
    nullif(new.raw_user_meta_data->>'branch_name', '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;
