import axios from 'axios';

const fetchUserProfile = async (token) => {
  const response = await axios.get('http://192.168.1.2:8000/users/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
