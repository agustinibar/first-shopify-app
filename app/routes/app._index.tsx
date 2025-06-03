// Dashboard.tsx
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  ButtonGroup,
  BlockStack,
  DatePicker,
  Modal,
  Toast,
  Frame,
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { useFetcher, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      shop {
        metafield(namespace: "custom", key: "locked_delivery_data") {
          id
          key
          value
        }
      }
    }
  `);

  const metafield = await response.json();

  if (metafield?.data?.shop?.metafield && metafield.data.shop.metafield.value) {
    const parsedValue = JSON.parse(metafield.data.shop.metafield.value);
    return json(parsedValue);
  }

  return json({
    blockedWeekdays: [],
    blockedDates: [],
    blockedRanges: [],
  });
}

export default function Dashboard() {
  const fetcher = useFetcher();
  const data = useLoaderData<{
    blockedWeekdays: number[];
    blockedDates: string[];
    blockedRanges: { start: string; end: string }[];
  }>();

  const [blockedDays, setBlockedDays] = useState<number[]>(data.blockedWeekdays || []);
  const [blockedDates, setBlockedDates] = useState<string[]>(data.blockedDates || []);
  const [blockedRanges, setBlockedRanges] = useState<{ start: string; end: string }[]>(data.blockedRanges || []);
  const originalData = data;

  const [modalOpen, setModalOpen] = useState(false);
  const [isRange, setIsRange] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [toastActive, setToastActive] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'date' | 'range'; index: number } | null>(null);

  const toggleToastActive = () => setToastActive((active) => !active);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const daysOfWeek = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
  ];

  const toggleDay = (dayValue: number) => {
    setBlockedDays((prev) => (
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue]
    ));
  };

  const hasChanges = () => {
    const areArraysEqual = (arr1: any[], arr2: any[]) => JSON.stringify(arr1) === JSON.stringify(arr2);
    return (
      !areArraysEqual(blockedDays, originalData.blockedWeekdays) ||
      !areArraysEqual(blockedDates, originalData.blockedDates) ||
      !areArraysEqual(blockedRanges, originalData.blockedRanges)
    );
  };

  const handleSave = async () => {
    const payload = {
      blockedWeekdays: blockedDays,
      blockedDates: blockedDates,
      blockedRanges: blockedRanges,
    };

    await fetcher.submit(
      { payload: JSON.stringify(payload) },
      {
        method: "post",
        action: "/api/blocked-dates",
        encType: "application/json",
      }
    );

    setToastActive(true);
  };

  const handleDeleteClick = (type: 'date' | 'range', index: number) => {
    setDeleteTarget({ type, index });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'date') {
        const updatedDates = [...blockedDates];
        updatedDates.splice(deleteTarget.index, 1);
        setBlockedDates(updatedDates);
      } else if (deleteTarget.type === 'range') {
        const updatedRanges = [...blockedRanges];
        updatedRanges.splice(deleteTarget.index, 1);
        setBlockedRanges(updatedRanges);
      }
    }
    setDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
  };

  return (
    <Page title="Dashboard">
      <Layout>

        {/* Blocked Days Section */}
        <Layout.Section>
          <Card>
            <div style={{ padding: '16px', borderBottom: '1px solid #e1e3e5' }}>
              <Text as="h2" variant="headingMd">
                Select Days
              </Text>
            </div>
            <div style={{ padding: '16px' }}>
              <Text as="p" variant="bodyMd" tone="subdued">
                Pick the days of the week you’d like to enable or disable in the calendar.
              </Text>
              <div style={{ marginTop: '16px' }}>
                <BlockStack gap="200">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day.value}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #e1e3e5',
                      }}
                    >
                      <Text as="span" variant="bodyMd">
                        {day.label}
                      </Text>
                      <Button
                        variant={blockedDays.includes(day.value) ? 'secondary' : 'primary'}
                        onClick={() => toggleDay(day.value)}
                      >
                        {blockedDays.includes(day.value) ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  ))}
              </BlockStack>
            </div>
            </div>
          </Card>
        </Layout.Section>

        {/* Blocked Dates Section */}
        <Layout.Section>
          <Card>
            <div style={{ padding: '16px', borderBottom: '1px solid #e1e3e5' }}>
              <Text as="h2" variant="headingMd">
                Select Dates
              </Text>
            </div>
            <div style={{ padding: '16px' }}>
              <Text as="p" variant="bodyMd" tone="subdued">
                Pick the dates you’d like to disable in the calendar.
              </Text>
              <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                <ButtonGroup>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setModalOpen(true);
                      setIsRange(false);
                    }}
                  >
                    Add Date
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setModalOpen(true);
                      setIsRange(true);
                    }}
                  >
                    Add Date Range
                  </Button>
                </ButtonGroup>
              </div>
              <BlockStack gap="200">
                {blockedDates.map((date, index) => (
                  <div
                    key={`date-${index}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #e1e3e5',
                    }}
                  >
                    <Text as="span" variant="bodyMd">{date}</Text>
                    <Button
                      variant="plain"
                      icon={DeleteIcon}
                      onClick={() => handleDeleteClick('date', index)}
                      accessibilityLabel="Delete date"
                    />
                  </div>
                ))}

                {blockedRanges.map((range, index) => (
                  <div
                    key={`range-${index}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #e1e3e5',
                    }}
                  >
                    <Text as="span" variant="bodyMd">{range.start} - {range.end}</Text>
                    <Button
                      variant="plain"
                      icon={DeleteIcon}
                      onClick={() => handleDeleteClick('range', index)}
                      accessibilityLabel="Delete range"
                    />
                  </div>
                ))}
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>

        {/* Save Button */}
        {hasChanges() && (
          <Layout.Section>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Button variant="primary" onClick={handleSave}>
                Save Settings
              </Button>
            </div>
          </Layout.Section>
        )}
      </Layout>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isRange ? "Add Date Range" : "Add Date"}
        primaryAction={{
          content: "Save",
          onAction: () => {
            if (isRange) {
              setBlockedRanges([
                ...blockedRanges,
                {
                  start: formatDate(selectedRange.start),
                  end: formatDate(selectedRange.end),
                },
              ]);
            } else {
              setBlockedDates([...blockedDates, formatDate(selectedDate)]);
            }
            setModalOpen(false);
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          {isRange ? (
            <DatePicker
              month={month}
              year={year}
              onChange={(range) => setSelectedRange(range)}
              onMonthChange={(month, year) => {
                setMonth(month);
                setYear(year);
              }}
              selected={selectedRange}
              allowRange
            />
          ) : (
            <DatePicker
              month={month}
              year={year}
              onChange={(range) => setSelectedDate(range.start)}
              onMonthChange={(month, year) => {
                setMonth(month);
                setYear(year);
              }}
              selected={selectedDate}
            />
          )}
        </Modal.Section>
      </Modal>

      {/* Toast */}
      <Frame>
        {toastActive && (
          <Toast
            content="Settings saved successfully!"
            onDismiss={toggleToastActive}
          />
        )}
      </Frame>

      {/* Confirm Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        title="Are you sure you want to remove?"
        primaryAction={{
          content: 'Yes',
          onAction: handleConfirmDelete,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: 'No',
            onAction: handleCancelDelete,
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            By clicking on “Yes”, you will remove the selected date/range.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
