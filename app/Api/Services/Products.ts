import Axios from '../Axios';

export const addCateGory = async (data: any) => {
        try {
            let {name} = data;
            let newData ={
                name:name
            } 
           
            console.log('Adding category with data:', newData);
            let res = await Axios.post('/menu/categories/', newData);
            console.log('Category added successfully:', res.data);
            return res.data;
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;   
        }
}

export const getCategories = async () => {
        try {
            let res = await Axios.get('/menu/categories/');
            return res.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;   
        }
}
export const addMenuItem = async (data: any) => {
        try {
            console.log(data,"menu from friend end")
            let res = await Axios.post('/menu/menu/', data);
            return res.data;
        } catch (error) {
            console.error('Error adding menu item:', error);
            throw error;   
        }
}

export const getMenuItems = async () => {
        try {
            let res = await Axios.get('/menu/menu/');
            return res.data;
        } catch (error) {
            console.error('Error fetching menu items:', error);
            throw error; 
        }
}
export const addModifier = async (data: any) => {
        try {
            console.log('Adding modifier with data:', data);
            let res = await Axios.post('/menu/modifiers/', data);
            console.log('Modifier added successfully:', res.data);
            return res.data;
        } catch (error) {
            console.error('Error adding modifier:', error);
            throw error;   
        }
}

export const getmodifiers = async () => {
        try {
            let res = await Axios.get('/menu/modifiers/');
            return res;
        } catch (error) {
            console.error('Error fetching modifiers:', error);
            throw error;   
        }
}


export const AddTax = async (data: any) => {
        try {
            let res = await Axios.post('/menu/taxes/', data);
            return res;
        } catch (error) {
            console.error('Error adding tax:', error);
            throw error;   
        }
}

export const getTaxes = async () => {
        try {
            let res = await Axios.get('/menu/taxes/');
            return res;
        } catch (error) {
            console.error('Error fetching taxes:', error);
            throw error;   
        }
}
