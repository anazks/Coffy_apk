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

export const CheckOutOrder = async (data: any) => {
        try {
            console.log(data)
            const response = await Axios.post('/orders/checkout/', data)
            console.log(data)
            return response
        }   catch (error) {
            throw error 
        }   
}