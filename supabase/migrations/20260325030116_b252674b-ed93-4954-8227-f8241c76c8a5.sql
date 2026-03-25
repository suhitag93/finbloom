
-- Enable pgvector extension
create extension if not exists vector;

-- TABLE 1: conversations
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index conversations_user_id_idx 
  on public.conversations(user_id, created_at desc);

alter table public.conversations enable row level security;

create policy "Users can only access their own conversations"
  on public.conversations
  for all
  using (auth.uid() = user_id);

-- TABLE 2: knowledge_base
create table public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  embedding vector(1536),
  category text check (category in ('faq', 'education', 'product', 'coaching')),
  title text,
  created_at timestamptz default now()
);

create index knowledge_base_embedding_idx 
  on public.knowledge_base 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.knowledge_base enable row level security;

create policy "Authenticated users can read knowledge base"
  on public.knowledge_base
  for select
  using (auth.role() = 'authenticated');

-- TABLE 3: user_context
create table public.user_context (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  financial_stage text,
  primary_goal text,
  money_feeling text[],
  onboarding_answers jsonb default '{}',
  persona_type text check (persona_type in (
    'avoider',
    'aspirational_learner',
    'financially_delegated',
    'rebuilder',
    'unknown'
  )) default 'unknown',
  updated_at timestamptz default now()
);

alter table public.user_context enable row level security;

create policy "Users can only access their own context"
  on public.user_context
  for all
  using (auth.uid() = user_id);

create trigger user_context_updated_at
  before update on public.user_context
  for each row
  execute function public.update_updated_at_column();

-- FUNCTION: match_knowledge
create or replace function public.match_knowledge (
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 3
)
returns table (
  content text,
  title text,
  category text,
  similarity float
)
language sql stable
as $$
  select
    kb.content,
    kb.title,
    kb.category,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
