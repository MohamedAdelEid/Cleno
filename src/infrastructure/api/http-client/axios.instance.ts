import axios from 'axios'
import { appConfig } from '@/infrastructure/config/app.config'

export const axiosInstance = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
