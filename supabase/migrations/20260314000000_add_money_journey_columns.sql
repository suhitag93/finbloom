-- Add money journey data columns to survey_responses
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS income_range text,
  ADD COLUMN IF NOT EXISTS accounts_held text[],
  ADD COLUMN IF NOT EXISTS money_behaviors text[],
  ADD COLUMN IF NOT EXISTS debt_situation text;
