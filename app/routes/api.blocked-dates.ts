import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }: { request: Request }) {
  const { admin } = await authenticate.admin(request);

  try {
    const { payload } = await request.json();
    const parsedPayload = JSON.parse(payload);

    const shopResponse = await admin.graphql(`
      query {
        shop {
          id
        }
      }
    `);
    const shopData = await shopResponse.json();
    const shopId = shopData.data.shop.id;

    if (!shopId) throw new Error("Shop ID not found.");

    const metafieldsSetResponse = await admin.graphql(
      `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
      `,
      {
        variables: {
          metafields: [
            {
              ownerId: shopId,
              namespace: "custom",
              key: "locked_delivery_data",
              type: "json",
              value: JSON.stringify(parsedPayload),
            },
          ],
        },
      }
    );

    const result = await metafieldsSetResponse.json();

    if (result.data.metafieldsSet.userErrors.length > 0) {
      const errorMessage = result.data.metafieldsSet.userErrors
        .map((e: any) => `${e.field.join(".")}: ${e.message}`)
        .join("; ");
      throw new Error(errorMessage);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error saving metafield:", error);
    return json({ success: false, message: error || "Unknown error occurred." }, { status: 500 });
  }
}
