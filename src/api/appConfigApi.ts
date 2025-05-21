import axiosInstance from "../utils/axios";

export const getAppConfig = async() =>{
    try {
        const response = await axiosInstance.get('/api/app/config')
        return response.data;
    } catch (error) {
        throw error
    }
}