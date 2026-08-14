import React, { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { listBlockedUserIds, unblockUser } from '@/services/blocks';
import { getProfile } from '@/services/profiles';
import type { Profile } from '@/types/database';

export default function BlockedList() {
  const { userId } = useAuth();
  const [blocked, setBlocked] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const ids = (await listBlockedUserIds(userId)).data ?? [];
    const profiles = await Promise.all(ids.map((id) => getProfile(id)));
    setBlocked(profiles.map((p) => p.data).filter((p): p is Profile => p !== null));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const onUnblock = async (blockedId: string) => {
    if (!userId) return;
    await unblockUser(userId, blockedId);
    load();
  };

  return (
    <ScreenContainer edges={['bottom']}>
      <FlatList
        data={blocked}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ paddingTop: space.md, gap: space.sm }}
        ListEmptyComponent={<EmptyState icon="user-x" title="Nobody blocked." body="People you block will show up here." />}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Avatar name={item.display_name ?? 'Commuter'} imageUrl={item.avatar_url} />
            <Text variant="bodyMedium" style={{ flex: 1 }}>{item.display_name ?? 'A commuter'}</Text>
            <Button label="Unblock" onPress={() => onUnblock(item.id)} variant="secondary" />
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
