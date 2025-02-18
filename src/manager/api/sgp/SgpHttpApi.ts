import { AxiosInstance } from 'axios'

export class SgpHttpApi {
  private sgp

  static _instance: SgpHttpApi
  static getInstance(_http: AxiosInstance) {
    if (!SgpHttpApi._instance) {
      SgpHttpApi._instance = new SgpHttpApi(_http)
    }
    return SgpHttpApi._instance
  }

  constructor(_http: AxiosInstance) {
  }
}
