CREATE TABLE public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group text,
  financial_journey text,
  money_feelings text[],
  money_is text,
  money_upbringing text,
  confident_self text,
  biggest_barrier text,
  app_dropout_reasons text[],
  engagement_drivers text,
  motivation_ranking text[],
  dream_goal text,
  anything_else text,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit survey"
  ON public.survey_responses FOR INSERT WITH CHECK (true);