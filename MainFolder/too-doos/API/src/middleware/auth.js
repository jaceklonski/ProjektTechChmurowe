const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
  }),
  issuer: process.env.KEYCLOAK_ISSUER,
  algorithms: ['RS256'],
});

function checkRole(requiredRole) {
  return (req, res, next) => {
    const roles = req.auth?.realm_access?.roles || [];
    if (roles.includes(requiredRole)) return next();
    return res.status(403).json({ message: 'Brak uprawnień (rola)' });
  };
}

module.exports = {
  checkJwt,
  verifyToken: checkJwt,
  checkRole
};
