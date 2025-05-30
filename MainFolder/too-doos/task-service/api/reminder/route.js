import { sendReminders } from '../../../lib/reminder';

export async function GET(request) {
  try {
    await sendReminders();
    return new Response(
      JSON.stringify({ message: 'Przypomnienia zostały wysłane pomyślnie.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Błąd podczas wysyłania przypomnień:', error);
    return new Response(
      JSON.stringify({ error: 'Błąd podczas wysyłania przypomnień.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
