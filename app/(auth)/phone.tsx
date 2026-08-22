import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { track } from '@/services/analytics';
import { sendPhoneOtp, verifyPhoneOtp } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

const RESEND_SECONDS = 60;

export default function PhoneAuth() {
  const router = useRouter();
  const enterGuest = useAuthStore((s) => s.enterGuest);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async (isResend = false) => {
    setError(null);
    setLoading(true);
    if (isResend) track('phone_resend');
    const result = await sendPhoneOtp(phone);
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setSentTo(result.data.phone);
    setCooldown(RESEND_SECONDS);
  };

  const verify = async () => {
    if (!sentTo) return;
    setError(null);
    setLoading(true);
    const result = await verifyPhoneOtp(sentTo, code);
    setLoading(false);
    if (result.error) setError(result.error.message);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: space.xl }}>
          <Text variant="h1" style={{ marginBottom: space.xs }}>
            {sentTo ? 'Enter the code.' : 'Continue with phone.'}
          </Text>
          <Text variant="body" color="textSecondary" style={{ marginBottom: space.xl }}>
            {sentTo
              ? 'We sent a short code to your phone. It expires soon.'
              : 'We will text you a code. We will not say whether this number already has an account.'}
          </Text>

          {!sentTo ? (
            <>
              <TextField
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                placeholder="98765 43210"
              />
              <Text variant="caption" color="textSecondary" style={{ marginBottom: space.md }}>
                India numbers default to +91. Include a country code for anywhere else.
              </Text>
              {error && <InlineError message={error} />}
              <View style={{ height: space.md }} />
              <Button label="Send code" onPress={() => sendCode(false)} loading={loading} fullWidth />
            </>
          ) : (
            <>
              <TextField
                label="Code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={8}
                placeholder="6-digit code"
              />
              {error && <InlineError message={error} />}
              <View style={{ height: space.md }} />
              <Button label="Verify" onPress={verify} loading={loading} fullWidth />
              <View style={{ height: space.sm }} />
              <Button
                label={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                onPress={() => sendCode(true)}
                disabled={cooldown > 0}
                variant="secondary"
                fullWidth
              />
              <Button
                label="Use a different number"
                variant="ghost"
                onPress={() => {
                  setSentTo(null);
                  setCode('');
                  setError(null);
                  setCooldown(0);
                }}
              />
            </>
          )}

          <View style={{ marginTop: space.xl, gap: space.sm }}>
            <Button label="Continue with Google" variant="secondary" onPress={() => router.replace('/(auth)/welcome')} fullWidth />
            <Button
              label="Continue as Guest"
              variant="ghost"
              onPress={async () => {
                track('guest_started');
                await enterGuest();
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
