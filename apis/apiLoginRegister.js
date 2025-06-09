import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

//const API_URL = 'http://localhost:8000';
//const API_URL = 'http://10.100.224.45:8080';
//const API_URL = 'http://192.168.1.42:8000';
const API_URL = 'http://192.168.1.2:8000';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
      username: email, // importante: email como username
      password,}
    
    );
      console.log('Login response:', response.data);

      SecureStore.setItemAsync('token', response.data.access_token);
      return response.data.access_token;
    }
    catch (error) {
        console.error('Error during registration:', error.response?.data || error.message);
        throw error;
        }
};

export const register = async (body) => {
    try {
    const response = await axios.post(`${API_URL}/auth/register`, { ...body });
    return response.data;
    }
    catch (error) {
        console.error('Error during registration:', error.response ? error.response.data : error.message);
        throw error;
    }
};


/*
export const getProfile = async () => {
    const token = await SecureStore.getItemAsync('token');
    const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return response.data;
}

export const fetchListTours = async () => {
    try {
      const token = await SecureStore.getItemAsync('token'); // Retrieve token securely
      if (!token) {
        throw new Error('Token not found');
      }
      const response = await axios.get(`${API_URL}/api/auth/tours`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tours:', error);
      throw error;
    }
  };

export const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    // Remove token securely
};
*/