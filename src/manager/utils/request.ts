import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig
} from 'axios'
import { isRenderer } from './utils'

export default class Request {
  private readonly _http: AxiosInstance
  get http(): AxiosInstance {
    return this._http
  }

  /**
   * config {
   *       baseURL: `https://127.0.0.1:${lolPort}`,
   *       httpsAgent: new https.Agent({
   *         rejectUnauthorized: false,
   *         keepAlive: true,
   *         maxCachedSessions: 2048,
   *         maxFreeSockets: 1024
   *       }),
   *       httpAgent: new https.Agent({
   *         keepAlive: true,
   *         maxFreeSockets: 1024
   *       }),
   *       // baseURL: `${import.meta.env.VITE_BASE_HOST}:${lolPort}`,
   *       // baseURL: `${import.meta.env.VITE_BASE_HEADER}${import.meta.env.VITE_RIOT}:${lolAuthToken}${import.meta.env.VITE_WS_HOST}:${lolPort}`,
   *       timeout: 10000, // 设置超时时间
   *       headers: {
   *         'Accept': 'application/json',
   *         'Content-Type': 'application/json',
   *         // 'Authorization': `Basic ${Buffer.from(`riot:${lolAuthToken}`).toString('base64')}`
   *         'Authorization': `Basic ${btoa(`${import.meta.env.VITE_RIOT}:${lolAuthToken}`)}`
   *       },
   *       auth: {
   *         username: import.meta.env.VITE_RIOT,
   *         password: lolAuthToken,
   *       },
   *       adapter: 'fetch',
   *     }
   * @param config
   */
  constructor(config: CreateAxiosDefaults) {
    this._http = axios.create(config)

    // 可以在这里添加请求拦截器和响应拦截器
    this._http.interceptors.request.use(
      (config: InternalAxiosRequestConfig<any>) => {
        // 在发送请求之前做些什么
        // console.log("发送请求：",config)
        return config
      },
      (error) => {
        // console.log("请求错误：",error)
        // 对请求错误做些什么
        return Promise.reject(error)
      }
    )

    this._http.interceptors.response.use(
      (response: AxiosResponse) => {
        // 对响应数据做点什么
        // if ( isRenderer() ) {
        //   return response.data
        // }
        return response
      },
      (error) => {
        // console.log("错误：",error)
        // 对响应错误做点什么
        if ( isRenderer() ) {
          // const { message } = useMsg()
          // if(error.status === 404) {
            // message.info('暂无数据')
          // } else message.error(error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this._http.get<T>(url, config).then(response => response.data)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this._http.post<T>(url, data, config).then(response => response.data)
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this._http.patch<T>(url, data, config).then(response => response.data)
  }
}

