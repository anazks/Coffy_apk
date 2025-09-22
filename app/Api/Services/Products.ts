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
            console.log("tax data:",data)
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
export const updateModifier = async(id:number,data:any)=>{
        try {
            console.log(data,id,"modifier from friend end")
            let res = await Axios.patch(`/menu/modifier-options/${id}/`,data)
            console.log(res,"modifier updated.....")
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

export const deleteCategory = async (id: number) => {
    try {
        console.log(id, "category id for deletion");
        let res = await Axios.delete(`/menu/categories/${id}/`);
        console.log(res, "category deleted.....");
        return res;
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const deleteMenu = async (id: number) => {
    try {
        console.log(id, "menu id for deletion");
        let res = await Axios.delete(`/menu/menu/${id}/`);
        console.log(res, "category menu.....");
        return res;
    } catch (error) {
        console.log(error);
        return error;
    }
};