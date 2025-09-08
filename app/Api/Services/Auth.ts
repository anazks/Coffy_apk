import Axios from '../Axios';

export const RegisterUser = async (data: any) => {
  try {
    console.log('Registering user with data:', data);
    const response = await Axios.post('/auth/register-store/', data);
    console.log('API Response:', response);
    return response;
  } catch (error) {
    throw error;
  }
}

export const LoginUser = async (data: any) => {
    try {
        console.log('Logging in user with data:', data);
        const response = await Axios.post('auth/login/', data);
        console.log('API Response:', response);
        return response;
    } catch (error) {
        throw error;
    }
}
export const getHealth = async () => {
    try {
        const response = await Axios.get('/health/');
        console.log('Health Check Response:', response);
    } catch (error) {
        throw error;   
    }   
}