import React, { useState } from 'react';

import { AuthProviderButton, GoogleGlyph } from '@/components/auth/AuthProviderButton';
import { AUTH_COPY } from '@/lib/authErrors';
import { signInWithGoogleOAuth } from '@/services/auth';

export interface GoogleSignInButtonProps {
  onError: (message: string) => void;
  disabled?: boolean;
}

export function GoogleSignInButton({ onError, disabled }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setLoading(true);
    const result = await signInWithGoogleOAuth();
    setLoading(false);
    if (result.error?.kind === 'cancelled') return;
    if (result.error) onError(result.error.message || AUTH_COPY.googleFailed);
  };

  return (
    <AuthProviderButton
      label="Continue with Google"
      glyph={<GoogleGlyph />}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      tone="outline"
    />
  );
}
