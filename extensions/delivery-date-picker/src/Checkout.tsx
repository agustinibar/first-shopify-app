import {
  reactExtension,
  DatePicker,
  useApplyMetafieldsChange,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />
);

function Extension() {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const applyMetafieldsChange = useApplyMetafieldsChange();

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const response = await fetch('https://chains-thin-compound-informational.trycloudflare.com/api/blocked-dates');
        const data = await response.json();
        if (data?.blockedDates) {
          setBlockedDates(data.blockedDates);
        }
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      }
    };

    fetchBlockedDates();
  }, []);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);

    await applyMetafieldsChange({
      type: 'updateMetafield',
      namespace: 'delivery',
      key: 'selected_date',
      valueType: 'string',
      value: date,
    });
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      disabled={blockedDates}
    />
  );
}
