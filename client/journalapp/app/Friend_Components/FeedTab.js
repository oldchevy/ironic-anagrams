//News feed tab!

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

import EntryList from '../Entry_Components/EntryList';
import styles from '../styles/FriendsTabStyles';

export default class FeedTab extends Component {
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
    this.getFriends(() => this.getAllFriendsMessages());
  }

  // This will happen when the component is mounted, and will show a list (via FriendsList) of 
  // friends (via Friend).
  getFriends(callback) {
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
      .then( resp => { 
        resp.json().then( json => {
          if (json.name !== 'SequelizeDatabaseError') {
            this.setState({ friendList: json });
            callback(json);
          }
        })
        .catch((error) => {
          console.warn('error on json():', error);
        });
      })
      .catch( error => {
        console.log('error on fetch()', error);
      });
    });
  }


  getAllFriendsMessages() {
    console.log('About to get all friends messages: ', this.state.friendList);
    var count = 0;
    var cb = () => {
      count++;
      console.log(this.state.allMessages, count);
      if (count === this.state.friendList.length) {
        console.log('Update the list entries');
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        //Sort the entries by date
        var cloneMessages = this.state.allMessages.slice();
        cloneMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        this.setState({
          entries: ds.cloneWithRows(cloneMessages)
        });
        console.log(this.state.entries);
      }
    };
    this.state.friendList.forEach(friend => this.getFriendPosts(friend.id, cb));
  }


  getFriendPosts(friendId, callback) {
    console.log('Getting a friends posts');
    AsyncStorage.multiGet(['@MySuperStore:token', '@MySuperStore:url'], (err, store) => {
      var token = store[0][1];
      var url0 = store[1][1];
      var url = `${url0}api/entries` + '/?userId=' + friendId.toString();
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      })
      .then( resp => { 
        resp.json().then( json => {
          console.log('Fetched friends posts', json);
          this.setState({
            allMessages: this.state.allMessages.concat(json)
          });
        })
        .then(callback)
        .catch((error) => {
          console.warn('fetch error on getrequest:', error);
        });
      });
    });
  }


  render() {

    return (
      <View style= { styles.container } >
        <ScrollView>
          <EntryList
            entries={ this.state.entries } 
            users={this.state.friendList}
            navigator={this.props.navigator} />
        </ScrollView>
      </View>
    );
  }
}
