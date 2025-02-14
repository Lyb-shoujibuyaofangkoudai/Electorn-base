// src/stores/requestDataStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRequestDataStore = defineStore('requestData', () => {
  // 定义状态
  const requestData = ref({}) // 存储所有请求数据
  const loadingStates = ref({}) // 存储加载状态
  const errorMessages = ref({}) // 存储错误信息

  /**
   * 设置请求数据到 store 中
   * @param {string} key - 请求标识符（如 URL 或自定义键）
   * @param {*} data - 网络请求返回的数据
   */
  const setRequestData = (key, data) => {
    requestData.value[key] = data
  }

  /**
   * 更新请求数据中的某个字段
   * @param {string} key - 请求标识符
   * @param {function|object} update - 更新函数或对象
   */
  const updateRequestData = (key: string | number, update: ((data:any) => Object) | Object) => {
    if ( !requestData.value[key] ) return

    if ( typeof update === 'function' ) {
      // 如果是函数，则调用函数更新数据
      requestData.value[key] = update(requestData.value[key])
    } else {
      // 如果是对象，则合并对象
      requestData.value[key] = { ...requestData.value[key], ...update }
    }
  }

  /**
   * 删除请求数据中的某个字段
   * @param {string} key - 请求标识符
   * @param {string|string[]} fields - 要删除的字段名（可以是单个字段或字段数组）
   */
  const deleteFieldsFromRequestData = (key, fields) => {
    if ( !requestData.value[key] ) return

    const fieldsArray = Array.isArray(fields) ? fields : [ fields ]
    fieldsArray.forEach((field) => {
      delete requestData.value[key][field]
    })
  }

  /**
   * 设置请求的加载状态
   * @param {string} key - 请求标识符
   * @param {boolean} isLoading - 是否正在加载
   */
  const setLoadingState = (key, isLoading) => {
    loadingStates.value[key] = isLoading
  }

  /**
   * 设置请求的错误信息
   * @param {string} key - 请求标识符
   * @param {string|null} errorMessage - 错误信息，null 表示清除错误
   */
  const setErrorMessage = (key, errorMessage) => {
    errorMessages.value[key] = errorMessage
  }

  /**
   * 清除某个请求的所有数据（包括数据、加载状态和错误信息）
   * @param {string} key - 请求标识符
   */
  const clearRequestData = (key) => {
    delete requestData.value[key]
    delete loadingStates.value[key]
    delete errorMessages.value[key]
  }

  /**
   * 执行网络请求并存储结果到 store 中
   * @param {string} key - 请求标识符
   * @param {function} fetchFunction - 返回 Promise 的网络请求函数
   * @example
   * const requestDataStore = useRequestDataStore()
   * requestDataStore.fetchData('summoner',async () => {
   *     return await api.summoner.getCurrentSummoner()
   *   })
   */
  async function fetchData(key: string, fetchFunction: Function)  {
    try {
      // 开始加载
      setLoadingState(key, true)
      setErrorMessage(key, null)

      // 执行网络请求
      const data = await fetchFunction()
      // 存储请求结果
      setRequestData(key, data)
    } catch ( error: any ) {
      // 捕获错误并存储错误信息
      setErrorMessage(key, error?.message || 'An unknown error occurred')
    } finally {
      // 结束加载
      setLoadingState(key, false)
    }
  }

  function getRequestData(key: string) {
    return requestData.value[key]
  }

  return {
    requestData,
    loadingStates,
    errorMessages,
    setRequestData,
    updateRequestData,
    deleteFieldsFromRequestData,
    setLoadingState,
    setErrorMessage,
    clearRequestData,
    fetchData,
    getRequestData
  }
})

if ( import.meta.hot )
  import.meta.hot.accept(acceptHMRUpdate(useRequestDataStore as any, import.meta.hot))
