import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  Switch,
  Slider,
  Picker,
  PickerIOS,
  AsyncStorage,
  Dimensions, 
  Alert
} from 'react-native';

import Form from 'react-native-form'
import Button from 'react-native-button';
import styles from '../styles/AuthGeneralStyles';

export default class LoginTab extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      username: '',
      fullname: '',
      password: ''
    };
  }

  submitUser() {
    var newUser = JSON.stringify({
      username: this.state.username,
      password: this.state.password
    });

    if (this.formStatus()){
      fetch(`${this.props.url}api/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: newUser
      })
      .then( resp => { resp.json()
        .then( json => {
          // Make sure there is no error in the login information. Detects if the username is not in the DB, or if the password is wrong.
          if ( json.error ) {
            Alert.alert(json.error);
          } else {
            try {
              AsyncStorage.multiSet([['@MySuperStore:token', json.token], ['@MySuperStore:username', this.state.username]], (err) => {
                if ( err ){ console.warn(err); }
                this.props.updateStatus(true);
              });
            } catch (error) {
              console.log('AsyncStorage error: ' + error.message);
            }
          }
        });
      })
      .catch((error) => { console.log("ERROR: ", error)});
    }
  }

  formStatus() {
    if (this.state.username.length !==0 && this.state.password.length !==0 ){
     return true
    } else {
     return false
    }
  }

  updateUsername(val) {
    var newProp = {'username': val.text};
    this.setState(newProp);
  }

  updatePassword(val) {
    var newProp = {'password': val.text};
    this.setState(newProp);
  }

  getState(){
    return this.state;
  }

  render() {

    return (
      <View style={styles.viewContainer}>
        <Form style={styles.formContainer}>

          <View style={styles.fieldContainer}>
            <Text style={styles.subHeader} > Email </Text>
            <TextInput
              onChangeText= { (text) => this.updateUsername( {text} ) }
              style= { styles.container }
              name="username"
              type="TextInput"/>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.subHeader} > Password </Text>
            <TextInput
              secureTextEntry={ true }
              onChangeText= { (text) => this.updatePassword( {text} ) }
              style= { styles.container }
              name="password"
              type="TextInput"/>
          </View>

        </Form>

        <Button
          style={ this.formStatus() ? styles.button : styles.disabledbutton}
          onPress={ () => this.submitUser() }>
          Log In
        </Button>

      </View>
    );

  }
}

