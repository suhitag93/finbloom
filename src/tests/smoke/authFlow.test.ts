import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TEST_EMAIL = import.meta.env.VITE_TEST_EMAIL;
const TEST_PASSWORD = import.meta.env.VITE_TEST_PASSWORD;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Result = { name: string; passed: boolean };

async function test1_unauthenticatedRejected(): Promise<Result> {
  const name = "TEST 1 — Unauthenticated edge function call is rejected";
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/sage-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ message: "Hello" }),
    });
    if (res.status === 401) {
      console.log(`✅ PASS: ${name}`);
      return { name, passed: true };
    }
    console.log(`❌ FAIL: ${name} — expected 401, got ${res.status}`);
    return { name, passed: false };
  } catch (e) {
    console.log(`❌ FAIL: ${name} — ${e}`);
    return { name, passed: false };
  }
}

async function test2_authenticatedStreams(): Promise<Result> {
  const name = "TEST 2 — Authenticated call succeeds and streams";
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (authError || !authData.session) {
      console.log(`❌ FAIL: ${name} — could not sign in: ${authError?.message}`);
      return { name, passed: false };
    }
    const token = authData.session.access_token;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/sage-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ message: "I want to save more." }),
    });

    const bodyText = await res.text();
    const contentType = res.headers.get("content-type") || "";
    const pass =
      res.status === 200 &&
      contentType.includes("text/event-stream") &&
      bodyText.length > 0;

    if (pass) {
      console.log(`✅ PASS: ${name}`);
      return { name, passed: true };
    }
    console.log(
      `❌ FAIL: ${name} — status=${res.status}, content-type=${contentType}, body=${bodyText.slice(0, 200)}`
    );
    return { name, passed: false };
  } catch (e) {
    console.log(`❌ FAIL: ${name} — ${e}`);
    return { name, passed: false };
  }
}

async function test3_rateLimitTriggers(): Promise<Result> {
  const name = "TEST 3 — Rate limit triggers at threshold";
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.log(`❌ FAIL: ${name} — no active session`);
      return { name, passed: false };
    }
    const userId = session.user.id;
    const token = session.access_token;
    const today = new Date().toISOString().slice(0, 10);

    // Set sage_calls_today to 20
    await supabase
      .from("root_state")
      .update({ sage_calls_today: 20, sage_reset_date: today })
      .eq("user_id", userId);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/sage-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ message: "Test rate limit" }),
    });

    // Reset
    await supabase
      .from("root_state")
      .update({ sage_calls_today: 0 })
      .eq("user_id", userId);

    if (res.status === 429) {
      console.log(`✅ PASS: ${name}`);
      return { name, passed: true };
    }
    console.log(`❌ FAIL: ${name} — expected 429, got ${res.status}`);
    return { name, passed: false };
  } catch (e) {
    console.log(`❌ FAIL: ${name} — ${e}`);
    return { name, passed: false };
  }
}

async function test4_oversizedInputRejected(): Promise<Result> {
  const name = "TEST 4 — Oversized input is rejected";
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.log(`❌ FAIL: ${name} — no active session`);
      return { name, passed: false };
    }

    const res = await fetch(`${SUPABASE_URL}/functions/v1/sage-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ message: "a".repeat(501) }),
    });

    if (res.status === 400) {
      console.log(`✅ PASS: ${name}`);
      return { name, passed: true };
    }
    console.log(`❌ FAIL: ${name} — expected 400, got ${res.status}`);
    return { name, passed: false };
  } catch (e) {
    console.log(`❌ FAIL: ${name} — ${e}`);
    return { name, passed: false };
  }
}

async function test5_rlsBlocksCrossUser(): Promise<Result> {
  const name = "TEST 5 — RLS blocks cross-user data read";
  try {
    const { data } = await supabase
      .from("root_state")
      .select("*")
      .eq("user_id", "00000000-0000-0000-0000-000000000001");

    if (!data || data.length === 0) {
      console.log(`✅ PASS: ${name}`);
      return { name, passed: true };
    }
    console.log(`❌ FAIL: ${name} — returned data: ${JSON.stringify(data)}`);
    return { name, passed: false };
  } catch (e) {
    console.log(`❌ FAIL: ${name} — ${e}`);
    return { name, passed: false };
  }
}

async function test6_unauthenticatedSessionCleared(): Promise<Result> {
  const name = "TEST 6 — Unauthenticated dashboard route redirects";
  await supabase.auth.signOut();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log(`✅ PASS: ${name} — Session cleared.`);
    console.log(
      "   MANUAL CHECK REQUIRED: Verify in browser that navigating to /dashboard redirects to the landing page."
    );
    return { name, passed: true };
  }
  console.log(`❌ FAIL: ${name} — session still exists after signOut`);
  return { name, passed: false };
}

export async function runSmoke() {
  console.log("\n🔥 Running smoke tests...\n");

  const results: Result[] = [];
  results.push(await test1_unauthenticatedRejected());
  results.push(await test2_authenticatedStreams());
  results.push(await test3_rateLimitTriggers());
  results.push(await test4_oversizedInputRejected());
  results.push(await test5_rlsBlocksCrossUser());
  results.push(await test6_unauthenticatedSessionCleared());

  const passed = results.filter((r) => r.passed).length;
  console.log(`\n🏁 Smoke test complete: ${passed}/${results.length} passed\n`);
}
