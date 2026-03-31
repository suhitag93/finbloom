-- Add full-text search column to knowledge_base
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate search_vector from title + content
UPDATE public.knowledge_base
SET search_vector = to_tsvector('english', coalesce(title, '') || ' ' || content);

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS knowledge_base_search_idx
  ON public.knowledge_base USING gin(search_vector);

-- Auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION public.knowledge_base_search_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title, '') || ' ' || NEW.content);
  RETURN NEW;
END;
$$;

CREATE TRIGGER knowledge_base_search_vector_update
  BEFORE INSERT OR UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.knowledge_base_search_update();

-- Replace match_knowledge to use full-text search instead of vector similarity
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(1536) DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 3,
  search_query text DEFAULT NULL
)
RETURNS TABLE (
  content text,
  title text,
  category text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.content,
    kb.title,
    kb.category,
    ts_rank(kb.search_vector, websearch_to_tsquery('english', search_query))::float AS similarity
  FROM public.knowledge_base kb
  WHERE search_query IS NOT NULL
    AND kb.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;