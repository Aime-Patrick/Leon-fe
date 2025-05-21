import axiosInstance from "../utils/axios";

export const sendMessage = async (to: string, message: string) => {
  try {
    const response = await axiosInstance.post("/api/whatsapp/send-message", {
      to,
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
export const getMessages = async () => {
  try {
    const response = await axiosInstance.get("/api/whatsapp/messages");
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

export const getMessagesByPhoneNumber = async (phoneNumber: string) => {
  try {
    const response = await axiosInstance.get(`/api/whatsapp/messages/${phoneNumber}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

export const getWhatsappUsers = async() =>{
  try {
    const response = await axiosInstance.get('/api/whatsapp/stats')
    return response.data
  } catch (error) {
    throw error;
  }
}