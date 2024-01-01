import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import {
  DndContext,
  // PointerSensor,
  closestCorners,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'

import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'


const ACTIVE_DRAG_ITEM_TYPE = {
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD',
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN'

}

function BoardContent({
  board,
  createNewColumn,
  createNewCard,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColum
}) {
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
    setOrderColumnState(board.columns)
  }, [board])

  // Cùng một thời điểm chỉ có thể kéo/thả một phần tử (column/card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setoldColumnWhenDraggingCard] = useState(null)

  // Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumnState.find(c => c?.cards?.map(j => j._id)?.includes(cardId))
  }

  // Khởi tạo function chung xử lý việc cập nhập lại state trong trường hợp di chuyển Card giữa các Column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active, over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
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

        // Thêm placeholder card nếu column đó rỗng
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      //Column mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo nó có tồn tại ở Column chưa, nếu có thì cần xoá nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Phải cập nhật lại chuẩn dữ liệu của columnId của card trong overColumn sau khi kéo giữa 2 column 
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }

        //Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới 
        nextOverColumn.cards = nextOverColumn?.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        //Xoá placeholderCard đi nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)

        //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }
      if (triggerFrom === 'handleDragEnd') {
        moveCardToDifferentColum(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns)
      }
      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    // console.log('handleDragStart:', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    // Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setoldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
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
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active, over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  // Trigger khi thả phân tử
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi container) thì không làm gì 
    if (!active || !over) return

    // Xử lý keo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCardId: là id của card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard: là card được tương tác đến bới activeCard
      const { id: overCardId } = over

      //Tìm 2 column theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // Nếu không tồn tại 1 trong 2 column thì return, không làm gì
      if (!activeColumn || !overColumn) return

      //Hành động kéo thả card giữa 2 columns khác nhau
      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart ) 
      //chứ không phải activeData trong scope handleDragEnd này vì sau khi di qua onDragOver tới đây là state của card đã bị cập nhật 1 lần rồi

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        //Hành động kéo thả giữa 2 column khác nhau
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active, over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      } else {
        // Hành động xử lý kéo thả card trong cùng 1 column

        // Lấy vị trí cũ (từ oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // Lấy vị trí mới (từ oldColumnWhenDraggingCard)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        //Dùng arrayMove của dnd-kit để sắp xếp lại mảng
        //Code của arrayMove ở: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardIds = dndOrderedCards.map(card => card._id)

        setOrderColumnState(prevColumns => {
          // Clone mảng OrderColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          //Tìm tới column mà đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          //cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCardIds

          return nextColumns
        })
        moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
      }
    }

    //Xử lý kéo thả Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      //Nếu vị trí kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // Lấy vị trí cũ (từ active)
        const oldColumnIndex = orderedColumnState.findIndex(c => c._id === active.id)
        // Lấy vị trí mới (từ over)
        const newColumnIndex = orderedColumnState.findIndex(c => c._id === over.id)

        //Dùng arrayMove của dnd-kit để sắp xếp lại mảng
        //Code của arrayMove ở: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumnState, oldColumnIndex, newColumnIndex)
        //Cập nhật state sau khi kéo thả
        setOrderColumnState(dndOrderedColumns)
        //Gọi lên props function moveColumns nằm ở component cha cao nhất( _id.jsx)
        moveColumns(dndOrderedColumns)


      }

    }

    // Những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null ban đầu 
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setoldColumnWhenDraggingCard(null)
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
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
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