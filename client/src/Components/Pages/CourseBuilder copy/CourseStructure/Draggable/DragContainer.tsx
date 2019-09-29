import React, { useState, useCallback, useEffect } from 'react'
import Card from './NodeDrag'
import update from 'immutability-helper'

const style = {
  width: "100%",
}

export interface Item {
  id: number
  text: string
}

export interface ContainerState {
  cards: Item[]
}

interface card {
  id: string;
  name: string;
}

interface structure {
  index: [number];
  cards: [card]
}

interface Props {
  Structure: structure;
}

const Container: React.FC<Props> = ({Structure}) => {
  {
    const [cards, setCards] = useState([] as Item[]);

    useEffect(() => {
        if(Structure.cards !== undefined && Structure.cards.length > 0) {
          let arr: Item[] = [];
          let i = 0;
          Structure.cards.map((item) => {
              arr.push({id: i++, text: item.name});
          })
          setCards(arr);
        } 
    }, [Structure]);

    const moveCard = useCallback(
      (dragIndex: number, hoverIndex: number) => {
        const dragCard = cards[dragIndex]
        setCards(
          update(cards, {
            $splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]],
          }),
        )
      },
      [cards],
    )

    const renderCard = (card: { id: number; text: string }, index: number) => {
      return (
        <Card
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
        />
      )
    }
    return (
      <>
        <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
      </>
    )
  }
}

export default Container
