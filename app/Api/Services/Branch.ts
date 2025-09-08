import Axios from '../Axios';

export const addBranch = async (data: any) => {
        try {
            console.log(data,"branch from friend end")
            let res = await Axios.post('/branches/', data);
            console.log(res,"branch from backend")
            return res;
        } catch (error) {
            console.error('Error adding branch:', error);
            throw error;   
        }
}
export const getBranches = async () => {
        try {
            let res = await Axios.get('/branches/');
            return res;
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw error;   
        }
}