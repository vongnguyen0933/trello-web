import axios from 'axios'
import { APP_ROOT } from '~/utils/constant'

export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${APP_ROOT}/v1/boards/${boardId}`)

  //Lưu ý: axios sẻ trả kết quả về qua property của nó là data
  return response.data
}
