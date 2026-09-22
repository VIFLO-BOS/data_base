module.exports = function validateEnvironment() {
  if (process.env.NODE_ENV !== 'production') return;
  for (const name of ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SUPABASE_URL']) {
    const value = process.env[name];
    if (!value) throw new Error(name + ' is required for production builds');
    let url;
    try { url = new URL(value); } catch { throw new Error(name + ' must be an HTTPS origin'); }
    if (url.protocol !== 'https:' || url.origin !== value || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      throw new Error(name + ' must be an HTTPS origin without a path or trailing slash');
    }
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
};
