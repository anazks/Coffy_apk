import Axios from '../Axios';


export const fetchProfile = async (data: any) => {
    try {
        let res = await Axios.get('/profile/');
        console.log(res,"profile from backend")
        return res;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;   
    }
}
export const getRole    = async () => {
    try {
        let res = await Axios.get('/profile/store-role/');
        return res.data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;   
    }
}

export const getStores = async () => {
    try {
        let res = await Axios.get('/stores/');
        return res.data;
    }
    catch (error) {
        console.error('Error fetching stores:', error);
        throw error;   
    }
}
