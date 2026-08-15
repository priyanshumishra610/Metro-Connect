import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { submitReport } from '@/services/reports';
import type { ReportCategory } from '@/types/database';

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
];

export default function Report() {
  const router = useRouter();
  const { userId: reportedUserId, conversationId } = useLocalSearchParams<{ userId?: string; conversationId?: string }>();
  const { userId: myId } = useAuth();

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    if (!myId || !category) return;
    setLoading(true);
    setError(null);
    const result = await submitReport({
      reporterId: myId,
      reportedUserId,
      conversationId,
      context: conversationId ? 'chat' : reportedUserId ? 'profile' : 'profile',
      category,
      details: details.trim() || undefined,
    });
    setLoading(false);
    if (result.error) return setError(result.error.message);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <ScreenContainer edges={['bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.sm }}>
          <Text variant="h2">Thanks for letting us know.</Text>
          <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
            We'll look into it. You won't see this person in your discovery while it's reviewed.
          </Text>
          <Button label="Done" onPress={() => router.back()} variant="secondary" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingTop: space.md }}>
        <Text variant="h2" style={{ marginBottom: space.lg }}>What's going on?</Text>

        <View style={{ gap: space.xs, marginBottom: space.lg }}>
          {CATEGORIES.map((option) => {
            const selected = category === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setCategory(option.value)}
                style={[styles.row, selected && styles.rowSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text variant="bodyMedium">{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextField
          label="Details (optional)"
          value={details}
          onChangeText={setDetails}
          placeholder="Anything that would help us understand"
          multiline
          maxLength={1000}
        />

        {error && <InlineError message={error} />}

        <Button label="Submit report" onPress={onSubmit} disabled={!category} loading={loading} fullWidth />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rowSelected: { borderColor: colors.danger, backgroundColor: 'rgba(179, 38, 30, 0.08)' },
});
