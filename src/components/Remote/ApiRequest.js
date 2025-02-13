const BASE_URL = 'http://192.168.0.88:90/api';

export const fetchBarkodGruplari = async () => {
    try {
        const response = await fetch(`${BASE_URL}/Product/GetBarkodGruplari`, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const jsonData = await response.json();
        return jsonData.data;
    } catch (error) {
        console.error('Error fetching barkod groups:', error);
        throw error;
    }
};

export const fetchBarkodDetaylari = async (barkod) => {
    try {
        const response = await fetch(`${BASE_URL}/Product/GetBarkodDetaylari?barkod=${barkod}`, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const jsonData = await response.json();
        return jsonData.data;
    } catch (error) {
        console.error('Error fetching barkod details:', error);
        throw error;
    }
};

export const fetchProductById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/Product/${id}`, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error fetching product details:', error);
        throw error;
    }
};
