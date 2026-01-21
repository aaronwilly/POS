import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const axiosInstance: AxiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error),
);

export default axiosInstance;
