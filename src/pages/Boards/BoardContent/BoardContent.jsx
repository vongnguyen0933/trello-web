import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import {
  DndContext,
  // PointerSensor,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { cloneDeep } from 'lodash'


const ACTIVE_DRAG_ITEM_TYPE = {
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD',
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN'

}

function BoardContent({ board }) {
  // Nếu dùng pointerSenser mặc định thì phải kết hợp với thuộc tính CSS touchAction: none ở phần tử kéo thả 
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

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

  // Cùng một thời điểm chỉ có thể kéo/thả một phần tử (column/card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)

  // Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumnState.find(c => c?.cards?.map(j => j._id)?.includes(cardId))
  }


  const handleDragStart = (event) => {
    // console.log('handleDragStart:', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }

  // Trigger trong quá trình kéo (drag) một phần tử
  const handleDragOver = (event) => {
    //Không làm gì nếu kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    // console.log('handleDragOver', event)

    //Nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các column
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi container) thì không làm gì 
    if (!active || !over) return

    // activeDraggingCardId: là id của card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là card được tương tác đến bới activeCard
    const { id: overCardId } = over

    //Tìm 2 column theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tồn tại 1 trong 2 column thì return không làm gì
    if (!activeColumn || !overColumn) return


    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong column ban đầu thì không làm gì 
    // Này chỉ là xử lý lúc kéo handleDragOver, kéo xong là handleDragEnd
    if (activeColumn._id !== overColumn._id) {
      setOrderColumnState(prevColumns => {
        // Tìm vị trí index của cái overCard trong Column (nơi activeCart chuẩn bị thả)
        const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)
        let newCardIndex

        const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0

        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

        // Clone mảng OderedColumnState cũ ra một cái mởi để xử lý data rồi return - cập nhật lại OrderedColumnState mới 
        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

        //Column cũ
        if (nextActiveColumn) {
          // Xoá card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

          //Cập nhật lại mảng cardOderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOderIds = nextActiveColumn.cards.map(card => card._id)
        }

        //Column mới
        if (nextOverColumn) {
          // Kiểm tra xem card đang kéo nó có tồn tại ở Column chưa, nếu có thì cần xoá nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

          //Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới 
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData)

          //Cập nhật lại mảng cardOderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOderIds = nextActiveColumn.cards.map(card => card._id)
        }
        console.log('nextColumn:', nextColumns)

        return nextColumns
      })
    }
  }
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi container) thì không làm gì 
    if (!active || !over) return

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
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }

  // console.log('activeDragItemId:', activeDragItemId)
  // console.log('activeDragItemType:', activeDragItemType)
  // console.log('activeDragItemData:', activeDragItemData)

  const customdropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }

  return (
    <DndContext
      sensors={mySensor}
      /* Thuật toán phát hiện va chạm(nếu không có nó thì lúc này sẽ không kéo qua Column được vì lúc này nó đang bị conflict 
      giữa card và colum), chúng ta dùng closestCorners thay vì closestCenter */
      collisionDetection={closestCorners}

      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >

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
        <DragOverlay dropAnimation={customdropAnimation}>
          {activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent