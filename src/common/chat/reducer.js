/* @flow weak */
import * as actions from './actions';
import Room from './room';
import { Record } from '../transit';
import { List, Seq, Map } from 'immutable';
import update from 'react/lib/update'

const State = Record({
  'rooms': List(),
  'messages': Map({})
}, 'chat');

const chatReducer = (state = new State(), action) => {
  switch (action.type) {
    case actions.ADD_ROOM: {
      const room = new Room(action.payload);
      return state.set('rooms', state.rooms.push(room));
    }

    case 'SET_ROOMS': {
      const rooms = action.rooms;
      let newRooms = [];
      for (let roomId in rooms) {
        let room = rooms[roomId];
        newRooms.push({
          id: roomId,
          creatorId: room.creatorId,
          name: room.name,
          presence: room.presence ? room.presence : {},
          messages: room.messages ? room.messages : []
        });
      }
      return state.set('rooms', List(newRooms));
    }

    case 'ADD_ROOM_MESSAGES': {
      const roomId = action.roomId;
      let newMessages = state.get('messages') ? state.get('messages') : Map({});
      let newRoomMessages = newMessages.get(roomId) ? newMessages.get(roomId) : List();
      let alreadyMessage = false;
      newRoomMessages.forEach((message) => {
        if (message.id == action.message.id) {
          alreadyMessage = true;
        }
      });
      if (alreadyMessage) {
        return state;
      }
      newRoomMessages = newRoomMessages.push(action.message);
      newMessages = newMessages.set(roomId, newRoomMessages);
      const newState = state.set('messages', newMessages);
      return newState;
    }

    default:
      return state;

  }
};

export default chatReducer;
