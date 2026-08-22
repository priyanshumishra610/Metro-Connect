import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { deleteAccount } from '@/services/account';

export default function DeleteAccount() {
  const router = useRouter();
  const { isDemoMode } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

  const onDelete = async () => {
    if (isDemoMode) return setError('Account deletion needs a real account.');
    setLoading(true);
    setError(null);
    const result = await deleteAccount();
    setLoading(false);
    if (result.error) return setError(result.error.message);
    router.replace('/(auth)/welcome');
  };

  return (
    <ScreenContainer edges={['bottom']}>
      <View style={{ paddingTop: space.lg, gap: space.md }}>
        <Icon name="alert-triangle" size={28} color={colors.danger} />
        <Text variant="h2">This can't be undone.</Text>
        <Text variant="body" color="textSecondary">
          Deleting your account removes your profile, commute, and interests immediately. Existing
          conversations stay intact for the other person, but your name will show as "Deleted
          user." This can't be reversed.
        </Text>

        <TextField
          label='Type "DELETE" to confirm'
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
        />

        {error && <InlineError message={error} />}

        <Button label="Delete my account" onPress={onDelete} disabled={!canDelete} loading={loading} variant="destructive" fullWidth />
      </View>
    </ScreenContainer>
  );
}
