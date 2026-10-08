import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database, JsonObject, OnboardingJob } from '@rn/db';
import type { PostgrestError } from '@supabase/supabase-js';

const MAX_BATCH_SIZE = 1000;
const INTERNAL_ROLES = new Set([
  'executive_admin',
  'systems_architect',
  'operations_lead',
  'security_officer',
]);

interface OnboardingInput {
  external_key: string;
  idempotency_key?: string;
  tenant_id?: string;
  payload: JsonObject;
}

type OnboardingInsert = Database['public']['Tables']['rn_onboarding_jobs']['Insert'];
type OnboardingResult = Pick<OnboardingJob, 'id' | 'external_key' | 'idempotency_key' | 'correlation_id' | 'status'>;

interface OnboardingJobTable {
  upsert(
    values: OnboardingInsert[],
    options: { onConflict: string; ignoreDuplicates: boolean },
  ): {
    select(columns: string): Promise<{ data: OnboardingResult[] | null; error: PostgrestError | null }>;
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOnboardingInput = (value: unknown): value is OnboardingInput => {
  if (!isRecord(value)) return false;
  return (
    typeof value.external_key === 'string' &&
    value.external_key.trim().length > 0 &&
    value.external_key.length <= 200 &&
    (value.idempotency_key === undefined ||
      (typeof value.idempotency_key === 'string' && value.idempotency_key.length <= 200)) &&
    (value.tenant_id === undefined || typeof value.tenant_id === 'string') &&
    isRecord(value.payload)
  );
};

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Onboarding service is not configured.' }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Cookie writes can fail in a read-only server component context.
        }
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Authenticated operator session required.' }, { status: 401 });
  }

  const role = user.app_metadata.role;
  if (typeof role !== 'string' || !INTERNAL_ROLES.has(role)) {
    return NextResponse.json({ error: 'Internal operator permission required.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!isRecord(body) || !Array.isArray(body.rows) || body.rows.length === 0) {
    return NextResponse.json({ error: 'Request must include a non-empty rows array.' }, { status: 400 });
  }
  if (body.rows.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Batch exceeds the ${MAX_BATCH_SIZE}-row limit.` },
      { status: 413 },
    );
  }
  if (!body.rows.every(isOnboardingInput)) {
    return NextResponse.json({ error: 'Every row must include a valid external_key and payload.' }, { status: 422 });
  }

  const jobs = body.rows.map((row) => ({
    external_key: row.external_key.trim(),
    idempotency_key: row.idempotency_key?.trim() || `client:${row.external_key.trim()}`,
    ...(row.tenant_id ? { tenant_id: row.tenant_id } : {}),
    requested_by: user.id,
    payload: row.payload,
  }));

  const { data, error } = await (supabase
    .from('rn_onboarding_jobs') as unknown as OnboardingJobTable)
    .upsert(jobs, { onConflict: 'idempotency_key', ignoreDuplicates: true })
    .select('id, external_key, idempotency_key, correlation_id, status');

  if (error) {
    return NextResponse.json({ error: 'Unable to queue onboarding batch.' }, { status: 500 });
  }

  return NextResponse.json(
    {
      accepted: data?.length || 0,
      requested: jobs.length,
      duplicateOrExisting: jobs.length - (data?.length || 0),
      jobs: data || [],
    },
    { status: 202 },
  );
}
