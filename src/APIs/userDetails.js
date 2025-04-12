import axios from "axios";

export const getUserDetails = async () => {
    try {
        console.log("Fetching user details from:", import.meta.env.VITE_SERVER_URL);
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/getUserDetails`, {
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log("User details response:", response);
        
        if (!response.data || response.data === "") {
            console.log("No user data returned, redirecting to login");
            window.location.href = "/login";
            return null;
        }
        return response.data;
    } catch (err) {
        console.error("Error fetching user details:", err);
        if (err.response && err.response.status === 401) {
            window.location.href = "/login";
        }
        return null;
    }
};
