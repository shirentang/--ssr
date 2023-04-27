import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Message } from '@arco-design/web-react'
import { DEFAULT_DATA } from './config'

import type { IResponse } from './types'

export class VAxios {
  instance: AxiosInstance
  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  setupInterceptors() {
    this.instance.interceptors.request.use(
      config => config,
      error => Promise.reject(error),
    )

    this.instance.interceptors.response.use(
      res => res,
      error => {
        if(error.response){
          console.log(error.response.status);
          switch(error.response.status){
            case 401:
              Message.info("未登录");
              window.location.href='/'
              break;
            default:
              Message.info("未知错误")
          }
        }    
        
        return Promise.reject(error)
      },
    )
  }

  transformResponse<T>(res: IResponse<T>) {
    // 处理错误 及 返回数据
    const error = null
    const { [DEFAULT_DATA]: data } = res

    return { data, error }
  }

  request<T>(config: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      this.instance
        .request<IResponse<T>>(config) // 这里的泛型是 IResponse<T>，而不是 T
        .then((res) => {
          const { data, error } = this.transformResponse<T>(res.data)

          if (error)
            reject(error)
          else
            resolve(data)
        })
        .catch(error => reject(error))
    })
  }

  get<T>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'GET' })
  }

  post<T>(config: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'POST' })
  }
}
