import axios from 'axios'
import { API_ROOT } from '~/utils/constant'


/** Board */
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  //Lưu ý: axios sẻ trả kết quả về qua property của nó là data
  return response.data
}

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}
/** Columns */

export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  //Lưu ý: axios sẻ trả kết quả về qua property của nó là data
  return response.data
}

/** Cards */
export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
  //Lưu ý: axios sẻ trả kết quả về qua property của nó là data
  return response.data
}
