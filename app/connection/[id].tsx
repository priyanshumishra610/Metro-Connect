import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { respondToConnection } from '@/services/connections';
import { supabase } from '@/lib/supabase';
import { shouldUseLocalData } from '@/lib/dataMode';
import type { Connection, Profile } from '@/types/database';

export default function ConnectionDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useAuth();

  const [connection, setConnection] = useState<Connection | null>(null);
  const [counterpart, setCounterpart] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (!id || shouldUseLocalData() || !userId) {
      setLoading(false);
      return;
    }
    supabase
      .from('connections')
      .select('*, requester:profiles!connections_requester_id_fkey(*), addressee:profiles!connections_addressee_id_fkey(*)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setConnection(data as Connection);
          const other = (data as any).requester_id === userId ? (data as any).addressee : (data as any).requester;
          setCounterpart(other);
        }
        setLoading(false);
      });
  }, [id, userId]);

  const respond = async (status: 'accepted' | 'declined') => {
    if (!id) return;
    setResponding(true);
    await respondToConnection(id, status);
    setResponding(false);
    router.replace('/(tabs)/connections');
  };

  if (loading) {
    return (
      <ScreenContainer edges={['top']}>
        <ActivityIndicator style={{ marginTop: space.xl }} />
      </ScreenContainer>
    );
  }

  if (!connection || !counterpart) {
    return (
      <ScreenContainer edges={['top']}>
        <Text variant="body" color="textSecondary" style={{ marginTop: space.xl, textAlign: 'center' }}>
          This connection request isn't available anymore.
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md }}>
        <Avatar name={counterpart.display_name ?? 'Commuter'} imageUrl={counterpart.avatar_url} size={80} />
        <Text variant="h2">{counterpart.display_name ?? 'A fellow commuter'}</Text>
        <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
          wants to connect with you.
        </Text>
        {connection.status === 'pending' ? (
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
            <Button label="Decline" onPress={() => respond('declined')} variant="secondary" />
            <Button label="Accept" onPress={() => respond('accepted')} loading={responding} />
          </View>
        ) : (
          <Text variant="bodyMedium" color="success" style={{ marginTop: space.md }}>
            You're already connected.
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
}
