const { supabaseAdmin } = require('../config/supabaseAdmin');

/**
 * Resolves authenticated user from Supabase Bearer JWT.
 * Also supports the existing dev Master Root bypass (admin@aclap.org) in non-production environments.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (token) {
      const { data: authData, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && authData?.user) {
        const { data: userRow } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('auth_id', authData.user.id)
          .single();

        req.user = {
          id: authData.user.id,
          email: authData.user.email,
          role: userRow?.role || 'member',
          district: userRow?.district || null,
          fullName: userRow?.fullName || userRow?.full_name || authData.user.email,
        };
        return next();
      }
    }

    // Support existing Master Root dev bypass (SuperAdminLogin.jsx) in local dev
    const devRootEmail = req.headers['x-dev-root-email'];
    const devRootUid = req.headers['x-dev-root-uid'];
    if (
      process.env.NODE_ENV !== 'production' &&
      devRootEmail === 'admin@aclap.org' &&
      devRootUid === 'master-root'
    ) {
      req.user = {
        id: 'master-root',
        email: 'admin@aclap.org',
        role: 'super-admin',
        district: null,
        fullName: 'Master Root',
      };
      return next();
    }

    // Support local dev District Admin bypass if present
    const devAdminRole = req.headers['x-admin-role'];
    const devAdminDistrict = req.headers['x-admin-district'];
    const devAdminEmail = req.headers['x-admin-email'];
    if (process.env.NODE_ENV !== 'production' && devAdminRole) {
      req.user = {
        id: 'dev-district-admin',
        email: devAdminEmail || 'district-admin@aclap.org',
        role: devAdminRole,
        district: devAdminDistrict || null,
        fullName: `${devAdminDistrict || 'District'} Administrator`,
      };
      return next();
    }

    req.user = null;
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Error:', err);
    req.user = null;
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions for this action' });
  }
  next();
};

module.exports = {
  optionalAuth,
  requireAuth,
  requireRole,
};
