-- Transactional smoke check. All synthetic rows are rolled back.
begin;
do $$
declare u uuid:=gen_random_uuid(); p uuid:=gen_random_uuid(); r jsonb; awards jsonb;
begin
  insert into auth.users(id) values(u);
  insert into public.kryos_profiles(id,user_id,profile_type,display_name) values(p,u,'demo','Reward transaction test');
  insert into public.kryos_sync_blocks(profile_id,block_key,payload,revision) values(p,'tasks','{}',1),(p,'career','{}',1);
  insert into public.kryos_reward_awards(profile_id,event_id,amount,revision) values(p,'day:2026-09-17',20,1);
  select jsonb_agg(jsonb_build_object('id','v4-test:'||n,'amount',20)) into awards from generate_series(1,5) n;
  r:=public.kryos_commit_rewards_v4(p,1,1,awards,'{"id":"test-call","rewardId":"initiated-call","cost":1}',true);
  if r->>'accepted'<>'true' or (r->>'balance')::integer<>0 then raise exception 'Catalogue price was not enforced';end if;
  if (select amount from public.kryos_reward_awards where profile_id=p and event_id='day:2026-09-17')<>0 then raise exception 'Older award was not recalculated out';end if;
  r:=public.kryos_commit_rewards_v4(p,1,1,awards,'{"id":"test-call","rewardId":"initiated-call"}',true);
  if r->>'accepted'<>'true' or (r->>'balance')::integer<>0 then raise exception 'Retry was not idempotent';end if;
  r:=public.kryos_commit_rewards_v4(p,1,1,awards,'{"id":"test-movie","rewardId":"movie"}',true);
  if r->>'accepted'<>'false' then raise exception 'Overspending accepted';end if;
  r:=public.kryos_commit_rewards_v4(p,1,1,'[]',null,false);
  if (r->>'adjustmentDue')::integer<>100 then raise exception 'Correction was not accounted for';end if;
  if has_function_privilege('authenticated','public.kryos_commit_rewards_v4(uuid,bigint,bigint,jsonb,jsonb,boolean)','execute') then raise exception 'Browser can submit awards directly';end if;
end $$;
rollback;
