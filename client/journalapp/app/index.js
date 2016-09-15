import React, { Component } from 'react';

import {
    AsyncStorage
} from 'react-native';


import AuthParent from './Signup_Login_Components/AuthParent';
import Main from './Main';

export default class Journalapp extends Component {
  constructor(props) {
    super(props);
    //for running on deployment branch uncomment this one and comment out the other one: 
    //'https://journaldb.herokuapp.com/'
    //'http://localhost:3000/'
    AsyncStorage.setItem('@MySuperStore:url', 'http://localhost:3000/', (err) => ( err ? console.warn(err) : null ) );
    this.state = {
      url: 'http://localhost:3000/',
      loggedIn: false
    };
  }

  componentWillMount(){
    AsyncStorage.getItem('@MySuperStore:token', (err, token) => {
      var message = {text:this.state.text};
      if (token) {
        this.updateStatus(true);
      }
    });
  }

  signOut(){
    AsyncStorage.removeItem('@MySuperStore:token', (err) => {
      if (err) {console.log('Error: ', err)}
      this.updateStatus(false);
    })
  }

  updateStatus(status) {
    this.setState({
      loggedIn: status
    })
  }

  render() {
    return this.state.loggedIn ?
    (<Main signOut={ this.signOut.bind(this) }/>) :
    (<AuthParent updateStatus={this.updateStatus.bind(this)} url={this.state.url}/>)
  }
}
