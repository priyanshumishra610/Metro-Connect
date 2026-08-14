import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { professionOptions } from '@/constants/interests';
import { Chip } from '@/components/ui/Chip';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/services/profiles';
import { track } from '@/services/analytics';
import { voice } from '@/constants/copy';

export default function EditProfile() {
  const router = useRouter();
  const { profile, userId, isDemoMode, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [profession, setProfession] = useState(profile?.profession ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSave = async () => {
    if (isDemoMode || !userId) {
      setError('Editing needs a real account — connect Supabase to save changes.');
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateProfile(userId, { display_name: displayName, bio, profession });
    setSaving(false);
    if (result.error) return setError(result.error.message);
    track('profile_completed');
    await refreshProfile();
    setSuccess(true);
    setTimeout(() => router.back(), 700);
  };

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingTop: space.md }} keyboardShouldPersistTaps="handled">
        <TextField label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
        <TextField
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="A line or two about you"
          multiline
          maxLength={280}
        />

        <Text variant="label" color="textSecondary" style={{ marginBottom: space.xs, letterSpacing: 0.6 }}>PROFESSION</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginBottom: space.lg }}>
          {professionOptions.map((option) => (
            <Chip key={option} label={option} selected={profession === option} onPress={() => setProfession(option)} />
          ))}
        </View>

        {error && <InlineError message={error} />}
        {success && <Text variant="body" color="success">{voice.profileSaved}</Text>}

        <View style={{ height: space.md }} />
        <Button label="Save" onPress={onSave} loading={saving} fullWidth />
      </ScrollView>
    </ScreenContainer>
  );
}
