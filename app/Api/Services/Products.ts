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
            return res;
        } catch (error) {
            console.log('Error adding category:', error);
            throw error;   
        }
}

export const getCategories = async () => {
        try {
            let res = await Axios.get('/menu/categories/');
            return res.data;
        } catch (error) {
            console.log('Error fetching categories:', error);
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
            console.log('Error adding menu item:', error);
            throw error;   
        }
}

export const getMenuItems = async () => {
        try {
            let res = await Axios.get('/menu/menu/');
            return res.data;
        } catch (error) {
            console.log('Error fetching menu items:', error);
            throw error; 
        }
}


export const addModifier = async (data: any) => {
        try {
            console.log('Adding modifier with data:', data);
            let res = await Axios.post('/menu/modifiers/', data);
            console.log('Modifier added successfully:', res.data);
            return res;
        } catch (error) {
            console.log('Error adding modifier:', error);
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
            console.log('Error fetching modifiers:', error);
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
            console.log('Error updating modifier option:', error);
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
            console.log('Error adding modifier option:', error);
            throw error;   
        }
}

export const AddTax = async (data: any) => {
        try {
            console.log("tax data:",data)
            let res = await Axios.post('/menu/taxes/', data);
            return res;
        } catch (error) {
            console.log('Error adding tax:', error);
            throw error;   
        }
}

export const getTaxes = async () => {
        try {
            let res = await Axios.get('/menu/taxes/');
            console.log(res,"--")
            return res;
        } catch (error) {
            console.log('Error fetching taxes:', error);
            throw error;   
        }
}

export const deleteTax = async (id: number) => {
    try {
        console.log(id, "Taxes id for deletion");
        let res = await Axios.delete(`/menu/taxes/${id}/`);
        console.log("deletion response:",res);
        return res;
    } catch (error) {
        console.log("error in tax deletion",error);
        return error;
    }
};

export const editTax = async (id: number,data: any) => {
    try {
        console.log(id, "Taxes id for editing");
        console.log(data,"new tax data")
        let res = await Axios.put(`/menu/taxes/${id}/`,data);
        console.log("edited tax:",res);
        return res;
    } catch (error) {
        console.log("error in tax editing",error);
        return error;
    }
};



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

export const addModifierOptions = async (data: any) => {

    try {

        console.log('Adding modifier options with data:', data);
        let res = await Axios.post(`/menu/modifiers/${data.modifierId}/options/`, data);
        console.log('Modifier options added successfully:', res);
        return res;
    } catch (error) {
        console.log('Error adding modifier options:', error);
        throw error;
    }
}