import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sprout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import FinBloomIcon from "@/components/FinBloomIcon";

const STORAGE_KEY = "finbloom_survey_progress";

// ─── Question definitions ────────────────────────────────────
interface QuestionDef {
  id: string;
  type: "welcome" | "single" | "multi" | "text" | "email" | "completion";
  title?: string;
  subtitle?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  maxSelections?: number;
}

const QUESTIONS: QuestionDef[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "Help shape finBloom 🌱",
    subtitle:
      "5 minutes. Completely anonymous. Your answers will directly shape an app built for women like you.",
  },
  {
    id: "age_group",
    type: "single",
    title: "How old are you?",
    options: ["Under 25", "25-34", "35-44", "45-54", "55+"],
    required: true,
  },
  {
    id: "financial_journey",
    type: "single",
    title: "Where are you on your financial journey right now?",
    options: [
      "Getting through each month — saving isn't happening yet",
      "Covering the essentials, but consistency is a work in progress",
      "Building some savings, and ready to go further",
      "Feeling steady and actively growing my wealth",
    ],
    required: true,
  },
  {
    id: "biggest_difference",
    type: "single",
    title: "What would make the biggest difference to your financial life right now?",
    options: [
      "More knowledge — I want to understand how money works",
      "More confidence — I know what to do, I just can't make myself act",
      "More time — I get it, I just need it to be faster and easier",
      "More accountability — I need something to keep me on track",
      "More of everything — I'm starting from scratch",
      "My partner manages our finances — I'd like to be more involved",
    ],
    required: true,
  },
  {
    id: "money_feelings",
    type: "multi",
    title: "When you think about your personal finances, what comes up for you?",
    subtitle: "Select all that apply",
    options: [
      "A little uneasy — there's a lot to figure out",
      "Foggy — I'm not sure where to even begin",
      "Like I'm playing catch-up and that's okay",
      "Curious and ready to learn",
      "Energised — I'm already on a roll",
      "Honestly, I just try not to think about it",
    ],
    required: true,
  },
  {
    id: "money_is",
    type: "text",
    title: 'Finish this sentence: Money is...',
    placeholder: "No filter needed. Whatever comes to mind...",
    required: true,
  },
  {
    id: "money_upbringing",
    type: "single",
    title: "How was money talked about where you grew up?",
    options: [
      "It was a source of tension — we didn't talk about it",
      "It was mostly kept private or hush-hush",
      "I was taught to be careful and save",
      "Money conversations were open and empowering",
      "It was complicated — a bit of everything",
    ],
    required: true,
  },
  {
    id: "confident_self",
    type: "text",
    title: "Picture the most financially confident version of you. What is she doing?",
    placeholder:
      "She checks in on her money weekly without dread. She invests without second-guessing herself...",
    required: true,
  },
  {
    id: "biggest_barrier",
    type: "single",
    title: "What tends to get between you and actively engaging with your money?",
    options: [
      "It feels like a lot — I wouldn't know where to begin",
      "I'd rather not look too closely right now",
      "I feel like I need to catch up before I can get started",
      "It just doesn't hold my attention for long",
      "I second-guess my instincts when it comes to decisions",
      "I'm telling myself I'll start once I'm earning more",
      "Actually I'm pretty engaged — I just want to go further",
      "My partner handles it — it's not really on my plate right now",
    ],
    required: true,
  },
  {
    id: "app_dropout_reasons",
    type: "multi",
    title: "Have you ever tried a finance app and drifted away? If so, what happened?",
    subtitle: "Select all that apply",
    options: [
      "It felt cold and numbers-heavy — not made for me",
      "Progress felt invisible — I couldn't see myself growing",
      "It left me feeling like I was doing something wrong",
      "It didn't match how I actually think about money",
      "Life got busy and I lost the habit",
      "I haven't tried one yet",
      "I use one regularly and it works for me",
    ],
    required: true,
  },
  {
    id: "engagement_drivers",
    type: "text",
    title:
      "What would help you feel genuinely excited to check in on your finances regularly?",
    placeholder:
      "Think about tone, features, visuals, community — anything that would make it feel like something you look forward to...",
    required: true,
  },
  {
    id: "motivation_ranking",
    type: "multi",
    title: "Which of these would most make you want to show up for your money every day?",
    subtitle: "Pick your top 3",
    maxSelections: 3,
    options: [
      "A visual streak that keeps me coming back",
      "Badges and rewards that celebrate my milestones",
      "One small, doable action sent to me each day",
      "Watching my net worth grow over time like a game",
      "A community of women on the same journey as me",
      "A financial personality that actually sounds like me",
    ],
    required: true,
  },
  {
    id: "dream_goal",
    type: "text",
    title: "What's the one financial goal that would change everything for you right now?",
    placeholder:
      "Clear my credit card. Build a 3-month cushion. Finally start investing. Buy my first home...",
    required: true,
  },
  {
    id: "anything_else",
    type: "text",
    title: "Anything else you'd love the person building finBloom to know?",
    placeholder: "This is your space. Say anything...",
    required: false,
  },
  {
    id: "email",
    type: "email",
    title: "You're amazing. Thank you. 💚",
    subtitle:
      "Your answers will directly shape finBloom. Want to be a first-look tester or hear when we launch?",
  },
  {
    id: "completion",
    type: "completion",
    title: "You just did something powerful. 💚",
    subtitle:
      "Most people never stop to think about their relationship with money. You did. That already makes you different.",
  },
];

type Answers = Record<string, string | string[]>;

// ─── Main Survey Component ───────────────────────────────────
const Survey = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (typeof parsed.currentIndex === "number") setCurrentIndex(parsed.currentIndex);
      }
    } catch {}
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, currentIndex }));
    }
  }, [answers, currentIndex, submitted]);

  const question = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length - 2; // exclude welcome + completion
  const progressIndex = Math.max(0, currentIndex - 1);
  const progress = submitted ? 100 : Math.round((progressIndex / totalQuestions) * 100);

  const canAdvance = useCallback(() => {
    if (!question) return false;
    if (question.type === "welcome" || question.type === "completion" || question.type === "email") return true;
    if (!question.required) return true;
    const answer = answers[question.id];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer.trim().length > 0;
  }, [question, answers]);

  const goNext = useCallback(async () => {
    if (!canAdvance()) return;

    // If we're on the email screen, submit
    if (question.type === "email") {
      await submitSurvey();
      setCurrentIndex((i) => i + 1);
      return;
    }

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [canAdvance, currentIndex, question]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext]);

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const submitSurvey = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {};
      for (const q of QUESTIONS) {
        if (q.id === "welcome" || q.id === "completion") continue;
        const val = answers[q.id];
        if (val !== undefined && val !== "") {
          payload[q.id] = val;
        }
      }

      await (supabase.from as any)("survey_responses").insert(payload);

      // Also add to waitlist if email provided
      const email = (answers.email as string)?.trim();
      if (email) {
        await (supabase.from as any)("waitlist").insert({ email, source: "survey" });
      }

      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch {
      // silent fail — data is best-effort
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <FinBloomIcon size="lg" />
            <span className="font-display text-lg font-semibold text-foreground">FinBloom</span>
          </Link>
          {currentIndex > 0 && currentIndex < QUESTIONS.length - 1 && (
            <span className="text-xs text-muted-foreground">
              {progressIndex} of {totalQuestions}
            </span>
          )}
        </div>
        {/* Progress bar */}
        {currentIndex > 0 && (
          <div className="h-1 bg-secondary">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-24">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuestionScreen
                question={question}
                answer={answers[question.id]}
                onAnswer={(val) => setAnswer(question.id, val)}
                onNext={goNext}
                onSkipEmail={() => {
                  setAnswer("email", "");
                  submitSurvey().then(() => setCurrentIndex((i) => i + 1));
                }}
                submitting={submitting}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      {question.type !== "welcome" && question.type !== "completion" && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border/50 px-4 py-3">
          <div className="container mx-auto max-w-lg flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {question.type !== "email" && (
              <button
                onClick={goNext}
                disabled={!canAdvance() || submitting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {currentIndex === QUESTIONS.length - 2 ? "Submit" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Individual question screen renderer ─────────────────────
interface QuestionScreenProps {
  question: QuestionDef;
  answer: string | string[] | undefined;
  onAnswer: (val: string | string[]) => void;
  onNext: () => void;
  onSkipEmail: () => void;
  submitting: boolean;
}

const QuestionScreen = ({
  question,
  answer,
  onAnswer,
  onNext,
  onSkipEmail,
  submitting,
}: QuestionScreenProps) => {
  switch (question.type) {
    case "welcome":
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sprout className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            {question.title}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
            {question.subtitle}
          </p>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
          >
            Let's go <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );

    case "completion":
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            {question.title}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
            {question.subtitle}
          </p>
          <div className="flex justify-center pt-2">
            <FinBloomIcon size="lg" />
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
          >
            Back to finBloom
          </Link>
        </div>
      );

    case "single":
      return (
        <div className="space-y-6">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-tight">
            {question.title}
          </h2>
          <div className="space-y-2.5">
            {question.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onAnswer(opt);
                  // Auto-advance on single select after a brief delay
                  setTimeout(onNext, 300);
                }}
                className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all ${
                  answer === opt
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );

    case "multi":
      const selected = (answer as string[]) || [];
      const max = question.maxSelections;
      return (
        <div className="space-y-5">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-tight">
              {question.title}
            </h2>
            {question.subtitle && (
              <p className="text-muted-foreground text-sm mt-2">{question.subtitle}</p>
            )}
          </div>
          <div className="space-y-2.5">
            {question.options?.map((opt) => {
              const isSelected = selected.includes(opt);
              const isDisabled = !isSelected && !!max && selected.length >= max;
              return (
                <button
                  key={opt}
                  disabled={isDisabled}
                  onClick={() => {
                    const next = isSelected
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    onAnswer(next);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : isDisabled
                      ? "border-border/50 bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );

    case "text":
      return (
        <div className="space-y-5">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-tight">
            {question.title}
          </h2>
          <textarea
            value={(answer as string) || ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={question.placeholder}
            maxLength={2000}
            rows={4}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          {!question.required && (
            <p className="text-xs text-muted-foreground">Optional — feel free to skip</p>
          )}
        </div>
      );

    case "email":
      return (
        <div className="space-y-6 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            {question.title}
          </h2>
          <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
            {question.subtitle}
          </p>
          <div className="space-y-3 max-w-sm mx-auto">
            <input
              type="email"
              value={(answer as string) || ""}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="your@email.com"
              maxLength={255}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-center"
            />
            <button
              onClick={onNext}
              disabled={submitting || !((answer as string)?.trim())}
              className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {submitting ? "Saving..." : "Count me in"}
            </button>
            <button
              onClick={onSkipEmail}
              disabled={submitting}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default Survey;
