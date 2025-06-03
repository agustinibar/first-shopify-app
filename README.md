# 🛍️ Delivery Date Management App — Shopify Checkout Extension

## Overview
This Shopify app enhances the merchant and customer experience by allowing dynamic management of delivery dates. Merchants can block specific dates, weekdays, and date ranges. Customers can only select available delivery dates during the checkout process.

- Built with **Remix**, **TypeScript**, **Shopify CLI**, and **Polaris UI**.
- Fully compliant with **Checkout Extensibility** standards (no external API calls, no CORS issues).
- App-owned metafields are used for safe, real-time configuration without external infrastructure.

## Features
- ✅ **Merchant Dashboard**:
  - Block individual dates, weekdays, and ranges dynamically.
  - Built with **Polaris** components for a native Shopify Admin experience.
- ✅ **Checkout UI Extension**:
  - DatePicker renders only available delivery dates based on merchant settings.
  - Blocked dates, days, and ranges are disabled dynamically.
  - Selected date is stored securely as an **Order Metafield**.
- ✅ **No External APIs**:
  - All data is stored and fetched through Shopify **app-owned metafields**.
  - No additional hosting or server infrastructure required.

## Tech Stack
- **Framework**: Remix
- **Language**: TypeScript
- **UI**: Polaris (Shopify Admin UI)
- **Checkout Extension**: Shopify UI Extensions
- **Authentication**: Shopify OAuth
- **Data Storage**: App-Owned Metafields

## Installation Guide (For Reviewers)
1. Install the app into your Shopify Development Store.
2. Navigate to the app from your Shopify Admin.
3. In the **Dashboard**:
   - Configure blocked dates, weekdays, or date ranges.
   - Save the settings.
4. Proceed to **Checkout** on your store.
5. Select a delivery date from the DatePicker (blocked dates will be disabled).
6. Complete the checkout.
7. Verify the selected date is saved as a **Metafield** on the order.

## Project Structure
```text
/app
  /routes
    - index.tsx (Merchant Dashboard)
    - api/blocked-dates.ts (Metafield Saving Endpoint)
  shopify.server.ts

/extensions
  /checkout-date-picker
    /src
      - Checkout.tsx (Checkout UI Extension)
    shopify.extension.toml

shopify.app.toml
```



## Notes
- **API Scopes**: `read_metafields`, `write_metafields`, `read_orders`, `write_orders`
- **Extension Metafield Access**: Configured in `shopify.extension.toml`:
  toml
  [[extensions.metafields]]
  namespace = "custom"
  key = "locked_delivery_data"

## Developed by *Agustín Ibar*

