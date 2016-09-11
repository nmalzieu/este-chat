/* @flow */
import React, { Component } from 'react';
import { PageHeader, Title, View, Input, Form } from '../app/components';
import { connect } from 'react-redux';
import Chat from './ChatPage';
import { joinRoom, sendMessage, loadMessages, kickUserFromRoom } from '../../common/lib/redux-firebase/actions';

const ChatRoomMessage = ({ sender, content }) => (
  <View>
    {sender}
    : {content}
  </View>
);

class ChatRoomMessages extends Component {
  componentWillMount() {
    this.props.loadMessages(this.props.chatRoom.id);
  }
  onInputKeyDown = (event) => {
    const { chatRoom, sendMessage, viewer } = this.props;
    if (event.key !== 'Enter') {
      return;
    }

    // Fixme : we should not send viewer.id ourselves, it should
    // be set by Firebase because we can impersonate another user
    sendMessage(viewer, chatRoom.id, event.target.value);
    event.target.value = '';
  }
  render() {
    const { chatRoom, messages, viewer } = this.props;
    const roomMessages = messages.get(chatRoom.id);
    let shownMessages = [];
    if (roomMessages) {
      roomMessages.sort((m1, m2) => (m1.timestamp - m2.timestamp));
      shownMessages = roomMessages.map(message => <ChatRoomMessage sender={message.user.userName} content={message.content} key={message.id} />);
    }
    return (
      <View>{shownMessages}
        <Form small style={{ marginTop: '20px' }}>
          <Input name="sendMessage" label="" maxLength={100} onKeyDown={this.onInputKeyDown} placeholder="Send a message" />
        </Form>
      </View>
    );
  }
}

ChatRoomMessages = connect(state => ({ messages: state.chat.messages }), { sendMessage, loadMessages })(ChatRoomMessages);

class ChatRoomPage extends Component {
  componentDidMount() {
    if (this.props.viewer) {
      this.props.joinRoom(this.props.viewer, this.props.params.chatRoomId);
    }
  }
  render() {
    const chatRoomId = this.props.params.chatRoomId;
    let chatRoom = null;
    this.props.chatRooms.forEach(theChatRoom => {
      if (theChatRoom.id === chatRoomId) {
        chatRoom = theChatRoom;
      }
    });

    const kickUser = (userId) => () => {
      this.props.kickUserFromRoom(userId, chatRoomId);
    };

    if (chatRoom) {
      const chatRoomUsers = chatRoom.presence
        ? chatRoom.presence
        : {};

      let chatRoomUsersList = [];
      for (let userId in chatRoomUsers) {
        let user_email = chatRoomUsers[userId];
        if (chatRoom.creatorId == this.props.viewer.id && this.props.viewer.id != userId) {
          chatRoomUsersList.push(<li key={`chatRoomUser_${userId}`}>{user_email} <a href="#" onClick={kickUser(userId)}>(Kick)</a></li>);
        } else {
            chatRoomUsersList.push(<li key={`chatRoomUser_${userId}`}>{user_email}</li>);
        }
      }

      return (
        <View>
          <Title message={`Chat Room :“${chatRoom.name}”`} />
          <PageHeader description={""} heading={`Chat Room :“${chatRoom.name}”`} />
          <View>Users in this chatroom : <ul>{chatRoomUsersList}</ul></View>
          <ChatRoomMessages chatRoom={chatRoom} viewer={this.props.viewer} />
        </View>
      );
    } else {
      return (<Chat />);
    }
  }
}

ChatRoomPage = connect(state => ({ chatRooms: state.chat.rooms, viewer: state.users.viewer }), { joinRoom, kickUserFromRoom })(ChatRoomPage);

export default ChatRoomPage;
