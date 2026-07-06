/**
 * Admin auth is now handled server-side via src/serverFunctions/adminAuth.ts
 * The PIN is never computed or stored in client-side JavaScript.
 *
 * To set your admin password:
 *   Netlify dashboard → Site → Environment variables → Add ADMIN_PIN=your-password
 *
 * Without ADMIN_PIN set, a daily rotating code is used.
 * That code is printed to Netlify Functions logs (never the browser console).
 */
