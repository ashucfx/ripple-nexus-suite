'use client';

import { ErrorState } from '@rn/brand';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState title="Roster unavailable" onRetry={reset} />;
}
