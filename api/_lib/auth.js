const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
