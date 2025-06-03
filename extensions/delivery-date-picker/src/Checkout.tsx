import {
  reactExtension,
  DatePicker,
  useAppMetafields,
  useApplyMetafieldsChange,
} from '@shopify/ui-extensions-react/checkout';
import { useState } from 'react';

export default reactExtension('purchase.checkout.block.render', () => <Extension />);

function Extension() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const metafields = useAppMetafields({
    namespace: 'custom',
    key: 'locked_delivery_data',
  });

  const lockedDeliveryData = metafields[0]?.metafield.value;

  const applyMetafieldsChange = useApplyMetafieldsChange();

  const daysOfWeekAsString = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  let blockedDates: string[] = [];
  let blockedWeekdays: number[] = [];
  let blockedRanges: { start: string; end: string }[] = [];

  if (lockedDeliveryData) {
    const parsed = JSON.parse(lockedDeliveryData.toString());
    blockedDates = parsed.blockedDates || [];
    blockedWeekdays = parsed.blockedWeekdays || [];
    blockedRanges = parsed.blockedRanges || [];
  }

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
      disabled={[
        ...blockedDates,
        ...blockedWeekdays.map((day) => daysOfWeekAsString[day]),
        ...blockedRanges
      ]}
    />
  );
}
