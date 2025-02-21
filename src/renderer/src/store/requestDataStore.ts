// src/stores/requestDataStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRequestDataStore = defineStore('requestData', () => {
  const requestData = ref<any>({})
  const loadingStates = ref<any>({})
  const errorMessages = ref<any>({})

  const setRequestData = (key, data) => {
    requestData.value[key] = data
  }

  const updateRequestData = (key: string | number, update: ((data:any) => Object) | Object) => {
    if ( !requestData.value[key] ) return

    if ( typeof update === 'function' ) {
      requestData.value[key] = update(requestData.value[key])
    } else {
      requestData.value[key] = { ...requestData.value[key], ...update }
    }
  }


  const deleteFieldsFromRequestData = (key, fields) => {
    if ( !requestData.value[key] ) return

    const fieldsArray = Array.isArray(fields) ? fields : [ fields ]
    fieldsArray.forEach((field) => {
      delete requestData.value[key][field]
    })
  }


  const setLoadingState = (key, isLoading) => {
    loadingStates.value[key] = isLoading
  }


  const setErrorMessage = (key, errorMessage) => {
    errorMessages.value[key] = errorMessage
  }


  const clearRequestData = (key) => {
    delete requestData.value[key]
    delete loadingStates.value[key]
    delete errorMessages.value[key]
  }


  async function fetchData(key: string, fetchFunction: Function)  {
    try {
      setLoadingState(key, true)
      setErrorMessage(key, null)

      const data = await fetchFunction()
      setRequestData(key, data)
    } catch ( error: any ) {
      setErrorMessage(key, error?.message || 'An unknown error occurred')
    } finally {
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
