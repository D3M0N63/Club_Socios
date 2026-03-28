const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const EXPIRES = '7d';

function signToken(payload) {
  if (!SECRET) throw new Error('JWT_SECRET no configurado');
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

function verifyToken(event) {
  if (!SECRET) throw new Error('JWT_SECRET no configurado');
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  if (!header.startsWith('Bearer ')) {
    const e = new Error('Token requerido');
    e.status = 401;
    throw e;
  }
  const token = header.slice(7);
  try {
    return jwt.verify(token, SECRET);
  } catch {
    const e = new Error('Token inválido o expirado');
    e.status = 401;
    throw e;
  }
}

function requireAdmin(user) {
  if (user.role !== 'admin') {
    const e = new Error('Acceso denegado: se requiere rol administrador');
    e.status = 403;
    throw e;
  }
}

module.exports = { signToken, verifyToken, requireAdmin };
