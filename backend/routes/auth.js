const sql = require('../config/supabase');

async function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = auth.replace('Bearer ', '');
  try {
    const [session] = await sql`
      SELECT u.id, u.username, u.email, u.role
      FROM admin_login al
      JOIN "user" u ON al.user_id = u.id
      WHERE al.session_token = ${token} AND (al.expires_at IS NULL OR al.expires_at > NOW())
    `;
    if (!session) return res.status(401).json({ error: 'Invalid or expired session' });
    req.user = session;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = authMiddleware; 