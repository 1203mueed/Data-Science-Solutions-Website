const jwt = require('jsonwebtoken');

// Middleware to authenticate users
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).send({ error: 'Forbidden' });
  }
}

module.exports = authMiddleware;
