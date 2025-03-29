// In a real application, you would use a database
// For this example, we'll use an in-memory store
const users = new Map();

export const signup = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (users.has(email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Store user (in a real app, you'd hash the password and store in a database)
    users.set(email, password);

    // Set a session cookie
    res.cookie('session', email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
    });

    res.json({ message: 'Signup successful' });
};

export const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const storedPassword = users.get(email);
    if (!storedPassword || storedPassword !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set a session cookie
    res.cookie('session', email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
    });

    res.json({ message: 'Login successful' });
};

export const logout = (req, res) => {
    res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    res.json({ message: 'Logged out successfully' });
};

export const checkAuth = (req, res) => {
    const session = req.cookies.session;
    if (!session) {
        return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, email: session });
};

export const deleteAccount = (req, res) => {
    const session = req.cookies.session;
    if (!session) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    users.delete(session);
    res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    res.json({ message: 'Account deleted successfully' });
}; 