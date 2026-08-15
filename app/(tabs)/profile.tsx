import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { colors } from '@/constants/colors';
import { space, tabBarClearance } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';

const MENU_ITEMS: { icon: keyof typeof Feather.glyphMap; label: string; href: string }[] = [
  { icon: 'edit-2', label: 'Edit profile', href: '/settings/edit-profile' },
  { icon: 'shield', label: 'Safety Center', href: '/safety' },
  { icon: 'heart', label: 'Dating Lobby', href: '/dating-lobby' },
  { icon: 'gift', label: 'Invite people from your route', href: '/settings/invite' },
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function Profile() {
  const router = useRouter();
  const { profile, isDemoMode } = useAuth();

  return (
    <ScreenContainer edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: tabBarClearance }}>
        <View style={{ alignItems: 'center', paddingVertical: space.lg, gap: space.sm }}>
          <Avatar name={profile?.display_name ?? 'You'} imageUrl={profile?.avatar_url} size={84} verified={profile?.is_commute_verified} />
          <Text variant="h2">{profile?.display_name ?? 'You'}</Text>
          {profile?.profession && <Text variant="body" color="textSecondary">{profile.profession}</Text>}

          <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
            {profile?.is_profile_complete && <VerificationBadge kind="profile_complete" />}
            {profile?.is_commute_verified && <VerificationBadge kind="commute_verified" />}
            {profile?.is_identity_verified && <VerificationBadge kind="identity_verified" />}
          </View>

          {profile?.founding_commuter_number && (
            <Card style={styles.foundingCard}>
              <Feather name="award" size={14} color={colors.founding} />
              <Text variant="smallMedium" color="founding">
                FOUNDING COMMUTER #{String(profile.founding_commuter_number).padStart(3, '0')}
              </Text>
            </Card>
          )}

          {profile?.bio && (
            <Text variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: space.xs }}>
              {profile.bio}
            </Text>
          )}
        </View>

        <View style={{ gap: space.xs }}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={styles.menuRow}
              accessibilityRole="button"
            >
              <Feather name={item.icon} size={18} color={colors.textPrimary} />
              <Text variant="bodyMedium" style={{ flex: 1 }}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        {isDemoMode && (
          <Text variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: space.lg }}>
            You're browsing a local demo. Connect Supabase to create a real account.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  foundingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(138, 92, 18, 0.1)',
    borderColor: colors.founding,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
