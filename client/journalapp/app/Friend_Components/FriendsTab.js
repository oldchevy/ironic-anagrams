// app/index.js

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  AsyncStorage,
  Navigator,
  Dimensions,
  ListView
} from 'react-native';

import FriendList from './FriendList';
import RequestList from './RequestList';
import EntryList from '../Entry_Components/EntryList';

import styles from '../styles/FriendsTabStyles';

export default class FriendsTab extends Component {
  constructor(props) {
    super(props);

    this.props = props;

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      friendList: [],
      pendingRequests: [],
      allMessages: [],
      entries: ds.cloneWithRows([])
    };
  }

  componentWillMount() {
    this.getFriends();
    this.getFriendRequests();
  }

  // This will happen when the component is mounted, and will show a list (via FriendsList) of 
  // friends (via Friend).
  getFriends(){
    AsyncStorage.multiGet(['@MySuperStore:token', '@MySuperStore:url'], (err, store) => {
      var token = store[0][1];
      var url = store[1][1];
      fetch(`${url}api/friends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      })
      .then( resp => { resp.json()
        .then( json => {
          if (json.name !== 'SequelizeDatabaseError') {
            this.setState({ friendList: json });
          }
        })
        .catch((error) => {
          console.warn("error on json():", error)
        });
      })
      .catch( error => {
        console.log("error on fetch()", error)
      });
    });
  }


  // This will happen when the component is mounted, and will show a list (via RequestList) of 
  // requests (via Request).
  getFriendRequests() {
    AsyncStorage.multiGet(['@MySuperStore:token', '@MySuperStore:url'], (err, store) => {
      var token = store[0][1];
      var url = store[1][1];
      fetch(`${url}api/friendreq`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      })
      .then( resp => { resp.json()
        .then( json => {
          console.log(json, "myjson");
          this.setState({ pendingRequests: json });
        })
        .catch((error) => {
          console.warn("fetch error on getrequest:", error)
        });
      });
    });
  }

  // Accepting a friend request occurs on the Request view.
  acceptFriendRequest(requestId){
    AsyncStorage.multiGet(['@MySuperStore:token', '@MySuperStore:url'], (err, store) => {
      var token = store[0][1];
      var url = store[1][1];
      var message = { requestId: requestId };
      fetch(`${url}api/friendreq`, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
         'x-access-token': token
        },
        body: JSON.stringify(message)
      })
        .then((response) => {
          this.getFriendRequests();
          this.getFriends();
        })
          .catch((error) => {
            console.warn("fetch error:", error)
          });
    });
  }

  // Rejecting a friend request occurs on the Request view.  
  rejectFriendRequest(requestId) {
    AsyncStorage.multiGet(['@MySuperStore:token', '@MySuperStore:url'], (err, store) => {
      var token = store[0][1];
      var url = store[1][1];
      var req = {requestId: requestId};
      fetch(`${url}api/friendreq`, {
        method: 'DELETE',
        headers: {
         'Content-Type': 'application/json',
         'x-access-token': token
        },
        body: JSON.stringify(req)
      })
        .then((response) => {
          this.getFriendRequests();
        })
          .catch((error) => {
            console.warn("fetch error:", error)
          });
    });
  }

  render() {

    return (
      <View style= { styles.container } >
        <ScrollView>
          <RequestList 
            requestList={ this.state.pendingRequests } 
            acceptFriend={ this.acceptFriendRequest.bind(this) } 
            rejectFriend={ this.rejectFriendRequest.bind(this) }
            navigator={ this.props.navigator } />
          <FriendList 
            friendList={ this.state.friendList } 
            navigator={ this.props.navigator } 
            updateFriend={ this.props.updateFriend }/>
        </ScrollView>
      </View>
    )
  }
}
