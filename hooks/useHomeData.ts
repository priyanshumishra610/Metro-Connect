import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { getPrimaryCommuteWithStations, type CommuteWithStations } from '@/services/commute';
import { DEMO_STATIONS } from '@/services/demoData';
import { discoverCommuters, type DiscoveredPerson } from '@/services/discovery';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { ServiceError } from '@/utils/serviceResult';

export function useHomeData() {
  const { userId, isDemoMode } = useAuth();
  const onboarding = useOnboardingStore();

  const [commute, setCommute] = useState<CommuteWithStations | null>(null);
  const [people, setPeople] = useState<DiscoveredPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ServiceError | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      const homeName = onboarding.homeStationName ?? DEMO_STATIONS[0].name;
      const destinationName = onboarding.destinationStationName ?? DEMO_STATIONS[1].name;
      setCommute({
        id: 'demo-commute',
        user_id: userId,
        direction: 'outbound',
        home_station_id: onboarding.homeStationId ?? DEMO_STATIONS[0].id,
        destination_station_id: onboarding.destinationStationId ?? DEMO_STATIONS[1].id,
        metro_line_id: 'demo-line-blue',
        start_time: `${onboarding.startTime || '08:00'}:00`,
        end_time: `${onboarding.endTime || '09:00'}:00`,
        days_of_week: [1, 2, 3, 4, 5],
        frequency: onboarding.frequency ?? 'weekdays',
        is_primary: true,
        is_active: true,
        created_at: '',
        updated_at: '',
        home_station: { name: homeName },
        destination_station: { name: destinationName },
      });
    } else {
      const commuteResult = await getPrimaryCommuteWithStations(userId);
      if (commuteResult.error) setError(commuteResult.error);
      else setCommute(commuteResult.data);
    }

    const peopleResult = await discoverCommuters(userId);
    if (peopleResult.data) setPeople(peopleResult.data.slice(0, 5));
    else if (peopleResult.error) setError(peopleResult.error);

    setLoading(false);
  }, [userId, isDemoMode, onboarding.homeStationName, onboarding.destinationStationName, onboarding.homeStationId, onboarding.destinationStationId, onboarding.startTime, onboarding.endTime, onboarding.frequency]);

  useEffect(() => {
    load();
  }, [load]);

  return { commute, people, loading, error, reload: load };
}
