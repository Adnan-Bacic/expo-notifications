import { StatusBar, Alert } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'

//to send notification while app is running
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return{
      //show while running
      shouldShowAlert: true
    }
  }
})

const App = () => {

  const [pushToken, setPushToken] = useState()

  //for ios we must get permissions first. for android just enable in app.json
  useEffect(() => {
    //check if we are alowed to send permissions
    Permissions.getAsync(Permissions.NOTIFICATIONS)
    .then(statusObj => {
      //if we dont have, ask
      if(statusObj.status !== 'granted'){
        return Permissions.askAsync(Permissions.NOTIFICATIONS)
      }
      return statusObj
    })
    .then(statusObj => {
      //console.log(statusObj)
      //we dont get permissions
      if(statusObj.status !== 'granted'){
        throw new Error('Permissions not granted')
      }
    })
    //for push notifications

    //IMPORTANT: first create an expo account because we cannot use expo servers for notifications without an account
    //run: expo login
    //to login
    //must use a real phone
    .then(() => {
      console.log('getting token')
      //expo push service
      return Notifications.getExpoPushTokenAsync()
    })
    .then(response => {
      //in the console we see a data field with a token
      //console.log('expo push response', response)

      //test with: https://expo.io/notifications
      const token = response.data
      setPushToken(token)
    })
    .catch((err) => {
      console.log('catch block', err)
      return null
    })
  }, [])


  useEffect(() => {
    //do something when use clicks notification after it is received and tapped, outside app
    //notification response handler
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      //console.log(response)
    })

    //when notification is recevied inside app
    //the received handler is used
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      //console.log(notification)
    })

    //cleanup function
    return () => {
      backgroundSubscription.remove()
      foregroundSubscription.remove()
    }
  }, [])

  const triggerNotificationHandler = () => {
    //local notification
    //we must exit the app after clicking the button because local notifications cannot send while we are in the app
    Notifications.scheduleNotificationAsync({
      //content of notification
      content: {
        title: 'title content',
        body: 'body content',
        data:{
          dataToSend: 'data sent with click'
        }
      },
      //when to trigger
      trigger:{
        seconds: 3
      }
    })
  }

  const pushNotificationHandler = () => {
    const expoPushUrl = 'https://exp.host/--/api/v2/push/send'
    fetch(expoPushUrl, {
      method: 'POST',
      headers:{
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      //content of message
      body: JSON.stringify({
        to: pushToken,
        data:{
          someExtraData: 'content of exta data'
        },
        title: 'content of push title',
        body: 'content of push body'
      })
    })
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button title="Trigger notification"
      onPress={triggerNotificationHandler}
      style={{ marginBottom: 2 }}></Button>

      <Button title="Push notification"
      onPress={pushNotificationHandler}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App