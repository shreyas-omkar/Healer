export const checkAuth = (req, res, next) => {
    const session = req.cookies.session;
    if (!session) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please login to access this feature'
        });
    }
    // Add user info to request for use in controllers
    req.user = { email: session };
    next();
}; 