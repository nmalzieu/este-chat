/* @flow */
import { Record } from '../transit';

const Room = Record({
  name: '',
  id: '',
  creatorId: '',
}, 'room');

export default Room;
