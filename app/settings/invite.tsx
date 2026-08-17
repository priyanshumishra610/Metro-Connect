import { Icon, type IconName } from '@/components/ui/Icon';
import React, { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { space } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { buildReferralLink, buildReferralMessage, getOrCreateReferralCode, recordReferralEvent } from '@/services/referrals';

const CHANNELS: { icon: IconName; label: string }[] = [
  { icon: 'message-circle', label: 'WhatsApp' },
  { icon: 'instagram', label: 'Instagram' },
  { icon: 'send', label: 'Telegram' },
  { icon: 'link', label: 'Copy link' },
];

export default function Invite() {
  const { userId } = useAuth();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getOrCreateReferralCode(userId).then((result) => setCode(result.data));
  }, [userId]);

  const share = async () => {
    if (!code) return;
    await Share.share({ message: buildReferralMessage(code) });
    recordReferralEvent(code, 'sent');
  };

  return (
    <ScreenContainer edges={['bottom']}>
      <View style={{ paddingTop: space.md, gap: space.lg }}>
        <View>
          <Text variant="h2" style={{ marginBottom: space.xs }}>Grow your route.</Text>
          <Text variant="body" color="textSecondary">
            I'm trying Metro Connect. It connects people who take the same metro routes. You should join our route.
          </Text>
        </View>

        <Card style={{ gap: space.xs }}>
          <Text variant="caption" color="textSecondary">YOUR INVITE LINK</Text>
          <Text variant="bodyMedium" color="interactive">{code ? buildReferralLink(code) : 'Generating...'}</Text>
        </Card>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {CHANNELS.map((channel) => (
            <Pressable key={channel.label} onPress={share} style={styles.channel} accessibilityRole="button">
              <Icon name={channel.icon} size={20} color={colors.textPrimary} />
              <Text variant="small">{channel.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  channel: {
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
