/* @flow */
import OnlineUsers from '../users/OnlineUsers';
import React from 'react';
import linksMessages from '../../common/app/linksMessages';
import {
  Block,
  Heading,
  PageHeader,
  Title,
  View,
  Link,
  Input,
  Form
} from '../app/components';
import {saveRoom} from '../../common/lib/redux-firebase/actions';
import {connect} from 'react-redux';

const ChatRoom = ({room, viewer}) => {
  if (viewer.id in room.presence) {
    return (
      <li>
        <Link to={`/chat/${room.id}`}>
          {room.name}
        </Link>
      </li>
    );
  } else {
    return (
      <li>
        {room.name}
        <Link to={`/chat/${room.id}`}>
          (join)
        </Link>
      </li>
    );
  }
};

let ChatRooms = ({
  chatrooms = [],
  saveRoom,
  viewer
}) => {
  const onInputKeyDown = event => {
    if (event.key !== 'Enter') {
      return;
    }
    saveRoom(viewer, event.target.value);
    event.target.value = '';
  };

  return (
    <div>
      <h4>Please select a chatroom :</h4>
      <ul>
        {chatrooms && chatrooms.map(chatroom => <ChatRoom key={chatroom.id} room={chatroom} viewer={viewer}/>)
}
      </ul>
      <Form small>
        <Input name="newChatroom" label="" maxLength={100} onKeyDown={onInputKeyDown} placeholder="Add a chatroom"/>
      </Form>
    </div>
  );
};

ChatRooms = connect(null, {saveRoom})(ChatRooms);

const ChatPage = ({viewer, chatRooms}) => {
  return (
    <View>
      <Title message={linksMessages.chat}/>
      <PageHeader description={'A realtime chat through Firebase.'} heading="Chat"/>
      <Block>
        {(viewer)
          ? <ChatRooms chatrooms={chatRooms} viewer={viewer}/>
          : <p>Please login to access chat</p>}
      </Block>
      <Heading alt>Online users</Heading>
      <Block>
        <OnlineUsers/>
      </Block>
    </View>
  );
};

ChatPage.propTypes = {
  viewer: React.PropTypes.object,
  chatRooms: React.PropTypes.object
};

export default connect(state => ({viewer: state.users.viewer, chatRooms: state.chat.rooms}))(ChatPage);
