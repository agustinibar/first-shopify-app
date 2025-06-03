import { Page, Card, DatePicker, Button, ResourceList, Text, ResourceItem } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';

export default function HomePage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const loadBlockedDates = async () => {
    const res = await fetch('/api/blocked-dates', { credentials: 'include' });
    const data = await res.json();
    if (data?.blockedDates) {
      setSelectedDates(data.blockedDates);
    }
  };

  const handleMonthChange = useCallback((month: number, year: number) => {
    setMonth(month);
    setYear(year);
  }, []);

  const handleDaySelect = useCallback(
    (date: Date) => {
      setSelectedDay(date);
    },
    [],
  );

  const addDate = () => {
    if (selectedDay) {
      const dateString = selectedDay.toISOString().split('T')[0];
      if (!selectedDates.includes(dateString)) {
        setSelectedDates((prev) => [...prev, dateString]);
      }
    }
  };

  const removeDate = (date: any) => {
    setSelectedDates((prev) => prev.filter((d) => d !== date));
  };

  const handleSave = async () => {
    await fetch('/api/blocked-dates', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedDates: selectedDates }),
    });
    alert('Blocked dates saved successfully!');
  };

  useEffect(() => {
    loadBlockedDates();
  }, []);

  return (
    <Page title="Delivery Date Manager">
       <Card roundedAbove="sm">
      <Text as="h2" variant="headingSm">
        Online store dashboard
      </Text>
        <DatePicker
          month={month}
          year={year}
          selected={selectedDay ? { start: selectedDay, end: selectedDay } : undefined}
          onChange={({ start }) => handleDaySelect(start)}
          onMonthChange={handleMonthChange}
        />
        <div style={{ marginTop: 16 }}>
          <Button onClick={addDate}>Add Date</Button>
        </div>
        <div style={{ marginTop: 16 }}>
         <ResourceList
          resourceName={{ singular: 'date', plural: 'dates' }}
          items={selectedDates.map((date) => ({ id: date, date }))}
          renderItem={(item) => (
            <ResourceItem
              id={item.id}
              accessibilityLabel={`View details for ${item.date}`}
              shortcutActions={[
                {
                  content: 'Remove',
                  onAction: () => removeDate(item.id),
                },
              ]}
              name={item.date}
              onClick={() => {}} // 👈 NECESARIO
            />
          )}
        />

        </div>
        <div style={{ marginTop: 16 }}>
          <Button onClick={handleSave} variant='primary'>
            Save Blocked Dates
          </Button>
        </div>
      </Card>
    </Page>
  );
}
