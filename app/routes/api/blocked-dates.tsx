import { authenticate } from '../../shopify.server';
import { json } from '@remix-run/node';

// Simulación de base de datos temporal en memoria
let blockedDatesDB: string[] = []; // Esto es temporal. Luego podemos pasar a PostgreSQL, SQLite, etc.

export async function loader({ request }: { request: Request }) {
  // No necesitas autenticar porque es público para la extension
  return json({ blockedDates: blockedDatesDB });
}

export async function action({ request }: { request: Request }) {
  const { admin } = await authenticate.admin(request); // Autenticación solo para merchants que guardan.

  const { blockedDates } = await request.json(); // ["2024-06-10", "2024-06-15"]
  blockedDatesDB = blockedDates; // Guardamos en "base de datos" temporal.

  return json({ success: true });
}