'use client';

import { ErrorState } from '@rn/brand';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState title="Forge unavailable" onRetry={reset} />;
}
