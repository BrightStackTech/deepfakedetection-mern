import axios from "axios";

// Configure axios defaults
axios.defaults.withCredentials = true;

export const getUserDetails = async () => {
    try {
        console.log("Fetching user details from:", import.meta.env.VITE_SERVER_URL);

        // First check if there's a session cookie
        const cookies = document.cookie.split(';').map(c => c.trim());
        const hasSessionCookie = cookies.some(c => c.startsWith('connect.sid='));
        console.log("Session cookie present:", hasSessionCookie);

        // If no session cookie, check localStorage for user data as fallback
        if (!hasSessionCookie) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                console.log("Using stored user data from localStorage");
                return JSON.parse(storedUser);
            }
        }

        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/getUserDetails`, {
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log("User details response:", response);

        if (response.data && response.status === 200) {
            // Store the user data in localStorage as backup
            localStorage.setItem('user', JSON.stringify(response.data));
            return response.data;
        } else {
            console.log("No user data returned, redirecting to login");
            window.location.href = "/login";
            return null;
        }
    } catch (err) {
        console.error("Error fetching user details:", err);
        if (err.response && err.response.status === 401) {
            // Try to use stored user as fallback before redirecting
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                console.log("Using stored user data after auth failure");
                return JSON.parse(storedUser);
            }
            window.location.href = "/login";
        }
        return null;
    }
};

// Add this function to your userDetails.js file to test auth status
export const testAuthStatus = async () => {
    try {
        console.log("Testing auth status on:", import.meta.env.VITE_SERVER_URL);
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/test-auth`, {
            withCredentials: true
        });
        console.log("Auth status response:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error testing auth status:", err);
        return { error: err.message };
    }
};
