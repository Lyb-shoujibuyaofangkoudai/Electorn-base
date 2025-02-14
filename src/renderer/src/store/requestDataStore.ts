// src/stores/requestDataStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRequestDataStore = defineStore('requestData', () => {
  // ����״̬
  const requestData = ref({}) // �洢������������
  const loadingStates = ref({}) // �洢����״̬
  const errorMessages = ref({}) // �洢������Ϣ

  /**
   * �����������ݵ� store ��
   * @param {string} key - �����ʶ������ URL ���Զ������
   * @param {*} data - �������󷵻ص�����
   */
  const setRequestData = (key, data) => {
    requestData.value[key] = data
  }

  /**
   * �������������е�ĳ���ֶ�
   * @param {string} key - �����ʶ��
   * @param {function|object} update - ���º��������
   */
  const updateRequestData = (key: string | number, update: ((data:any) => Object) | Object) => {
    if ( !requestData.value[key] ) return

    if ( typeof update === 'function' ) {
      // ����Ǻ���������ú�����������
      requestData.value[key] = update(requestData.value[key])
    } else {
      // ����Ƕ�����ϲ�����
      requestData.value[key] = { ...requestData.value[key], ...update }
    }
  }

  /**
   * ɾ�����������е�ĳ���ֶ�
   * @param {string} key - �����ʶ��
   * @param {string|string[]} fields - Ҫɾ�����ֶ����������ǵ����ֶλ��ֶ����飩
   */
  const deleteFieldsFromRequestData = (key, fields) => {
    if ( !requestData.value[key] ) return

    const fieldsArray = Array.isArray(fields) ? fields : [ fields ]
    fieldsArray.forEach((field) => {
      delete requestData.value[key][field]
    })
  }

  /**
   * ��������ļ���״̬
   * @param {string} key - �����ʶ��
   * @param {boolean} isLoading - �Ƿ����ڼ���
   */
  const setLoadingState = (key, isLoading) => {
    loadingStates.value[key] = isLoading
  }

  /**
   * ��������Ĵ�����Ϣ
   * @param {string} key - �����ʶ��
   * @param {string|null} errorMessage - ������Ϣ��null ��ʾ�������
   */
  const setErrorMessage = (key, errorMessage) => {
    errorMessages.value[key] = errorMessage
  }

  /**
   * ���ĳ��������������ݣ��������ݡ�����״̬�ʹ�����Ϣ��
   * @param {string} key - �����ʶ��
   */
  const clearRequestData = (key) => {
    delete requestData.value[key]
    delete loadingStates.value[key]
    delete errorMessages.value[key]
  }

  /**
   * ִ���������󲢴洢����� store ��
   * @param {string} key - �����ʶ��
   * @param {function} fetchFunction - ���� Promise ������������
   * @example
   * const requestDataStore = useRequestDataStore()
   * requestDataStore.fetchData('summoner',async () => {
   *     return await api.summoner.getCurrentSummoner()
   *   })
   */
  async function fetchData(key: string, fetchFunction: Function)  {
    try {
      // ��ʼ����
      setLoadingState(key, true)
      setErrorMessage(key, null)

      // ִ����������
      const data = await fetchFunction()
      // �洢������
      setRequestData(key, data)
    } catch ( error: any ) {
      // ������󲢴洢������Ϣ
      setErrorMessage(key, error?.message || 'An unknown error occurred')
    } finally {
      // ��������
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
