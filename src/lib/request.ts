import axios from "axios";
const API_TOKEN = `eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNhbmdrYW5mYWlxQGdtYWlsLmNvbSIsInR5cGUiOiJmcm9udGVuZCIsImlhdCI6MTc1NTA3NTcxMiwiZXhwIjoxNzU1MDg0NzEyfQ.mnxYflBl-bvYCyAJBU43Hte33ooX8Yv7rNDvfsscw4E`

export async function fetchProductList() {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://recruitment-spe.vercel.app/api/v1/products',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });
        return response;
    } catch (error: any) {
        console.error("Direct API call failed:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
        throw error;
    }
}