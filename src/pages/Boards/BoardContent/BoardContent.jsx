import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'

import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'

import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'

function BoardContent({ board }) {
  // Nếu dùng pointerSenser mặc định thì phải kết hợp với thuộc tính CSS touchAction: none ở phần tử kéo thả 
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // Yêu cầu di chuyển chuột 10px thì mới kích hoạt event, fix lỗi click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  // Nhấn giữ 250ms và dung sai của cảm ứng 500px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // Ưu tiên sử dụng kết hợp 2 lại sensor là mouse & touch để trên mobile được sử dụng tốt, không bug
  const mySensor = useSensors(mouseSensor, touchSensor)

  const [orderedColumnState, setOrderColumnState] = useState([])

  useEffect(() => {
    const orderedColumn = mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOrderColumnState(orderedColumn)
  }, [board])

  const handleDragEnd = (event) => {
    console.log('handleDragEnd', event)
    const { active, over } = event

    // Check nếu không tồn tại over thì return luôn 
    if (!over) return

    //Vị trí kéo thả khác với vị trí ban đầu
    if (active.id !== over.id) {
      // Lấy vị trí cũ (từ active)
      const oldIndex = orderedColumnState.findIndex(c => c._id === active.id)
      // Lấy vị trí mới (từ over)
      const newIndex = orderedColumnState.findIndex(c => c._id === over.id)

      //Dùng arrayMove của dnd-kit để sắp xếp lại mảng
      //Code của arrayMove ở: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
      const dndOrderedColumn = arrayMove(orderedColumnState, oldIndex, newIndex)
      // console.log('dndOrderedColumn: ', dndOrderedColumn)
      // const dndOrderedColumnIds = dndOrderedColumn.map(c => c._id)
      // console.log(dndOrderedColumnIds)

      //Cập nhật state sau khi kéo thả
      setOrderColumnState(dndOrderedColumn)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={mySensor}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => (theme.trello.boardContentHeight),
        display: 'flex'
      }}>
        <ListColumns
          // columns={board?.columns} 
          columns={orderedColumnState}
        />
      </Box>
    </DndContext>
  )
}

export default BoardContent