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
            const response = await Axios.get('/orders/')
            return response.data
        } catch (error) {
            throw error 
        }
}

export const CheckOut = async (data: any) => {
        try {
            const response = await Axios.post('/orders/checkout/', data)
            return response.data
        }   catch (error) {
            throw error 
        }   
}