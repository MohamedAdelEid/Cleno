import axios from 'axios'
import { appConfig } from '@/infrastructure/config/app.config'
import { onRequestFulfilled } from './request.interceptor'
import { onResponseFulfilled, onResponseRejected } from './response.interceptor'

export const httpClient = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

httpClient.interceptors.request.use(onRequestFulfilled)
httpClient.interceptors.response.use(onResponseFulfilled, onResponseRejected)
