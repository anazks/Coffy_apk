import Axios from '../Axios'

export const createOrder = async (data: any) => {
        try {
            const response = await Axios.post('/orders/create/', data)
            return response.data
        } catch (error) {
            throw error 
        }
}

export const getOrders = async () => {
        try {
            const response = await Axios.get('/orders/order-list/')
            return response.data
        } catch (error) {
            throw error 
        }
}
export const getRecept = async (id: string) => {
        try {
            const response = await Axios.get(`/orders/${id}/receipt/`)
            return response.data
        } catch (error) {
            throw error 
        }
}
export const CheckOutOrder = async (data: any) => {
        try {
            console.log(data)
            const response = await Axios.post('/orders/checkout/', data)
            console.log(data)
            return response
        }   catch (error:any) {
            if (error.response) {
                        console.log("Status:", error.response.status);
                        console.log("Data:", error.response.data);
                        console.log("Headers:", error.response.headers);
                        } else {
                        console.log("Error message:", error.message);
                        }  
            throw error 
        }   
}