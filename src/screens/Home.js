import React from 'react';
import { Alert, View } from 'react-native';
import { ImagePicker, Permissions } from 'expo';

/* components */
import Button from 'app/src/components/Button';

export default class HomeScreen extends React.Component {
  async onPress(type) {
    const { status } =
      type === 'library'
        ? await Permissions.askAsync(Permissions.CAMERA_ROLL)
        : await Permissions.askAsync(
            Permissions.CAMERA,
            Permissions.CAMERA_ROLL,
          );
    if (status !== 'granted') {
      Alert.alert('Permission Required !');
      return;
    }
    const image =
      type === 'library'
        ? await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
          })
        : await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
          });
    if (image == null || image.cancelled) {
      return;
    }
    this.props.navigation.push('Cropping', {
      image,
    });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Button
          onPress={() => this.onPress('library')}
          text="Select a Picture from Library"
          style={{ marginTop: 100 }}
        />
        <Button
          onPress={() => this.onPress('camera')}
          text="Take a Picture with Camera"
          style={{ marginTop: 100 }}
        />
      </View>
    );
  }
}
