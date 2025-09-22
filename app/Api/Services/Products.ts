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
            console.log(res,"menu added.....")
            return res;
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

export const updateModifier = async(id:number,data:any)=>{
        try {
            console.log(data,id,"modifier from friend end")
            let res = await Axios.patch(`/menu/modifiers/${id}/`,data)
            console.log(res,"modifier updated.....")
            return res
        } catch (error) {
            console.log(error)
            return error
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

export const updateModifierOption = async (id: number, data: any) => {
        try {
            console.log('Updating modifier option with ID:', id, 'and data:', data);
            let res = await Axios.patch(`/menu/modifiers/${id}/options`, data);
            console.log('Modifier option updated successfully:', res.data);
            return res.data;
        } catch (error) {
            console.error('Error updating modifier option:', error);
            throw error;   
        }
}
export const addModifierOption = async (data: any) => {
        try {
            console.log('Adding modifier option with data:', data);
            let res = await Axios.post('/menu/modifier-options/', data);
            console.log('Modifier option added successfully:', res.data);
            return res.data;
        } catch (error) {
            console.error('Error adding modifier option:', error);
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
            console.log(res,"--")
            return res;
        } catch (error) {
            console.error('Error fetching taxes:', error);
            throw error;   
        }
}

export const CreateOrder = async(data:any)=>{
     try {
        console.log(data,"create order")
        let res = await Axios.post('/orders/create/',data)
        console.log(res)
        return res
     } catch (error) {
        console.log(error)
        return error
     }
}
export const getOrders = async()=>{
     try {
        let res = await Axios.get('/orders/order-list/')
        console.log(res)
        return res
     } catch (error) {
        console.log(error)
        return error
     }
}

export const updateCategory = async(id:number,data:any)=>{
        try {
            console.log(data,id,"category from friend end")
            let res = await Axios.patch(`/menu/categories/${id}/`,data)
            console.log(res,"category updated.....")
            return res
        }
        catch (error) {
            console.log(error)
            return error
        }
}
export const updateMenuItem = async(id:number,data:any)=>{
        try {
            console.log(data,id,"menu from friend end")
            let res = await Axios.patch(`/menu/menu/${id}/`,data)
            console.log(res,"menu updated.....")
            return res
        } catch (error) {
            console.log(error)
            return error
        }
}
