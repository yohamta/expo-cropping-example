import React from 'react';
import { View, Image } from 'react-native';
import { Header as RNHeader } from 'react-navigation';

export default class ResultScreen extends React.Component {
  state = {
    croppedImage: null,
  };

  componentDidMount() {
    const { croppedImage } = this.props.navigation.state.params;
    this.setState({
      croppedImage,
    });
  }

  render() {
    const { croppedImage } = this.state;
    if (croppedImage == null) {
      return <View />;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -RNHeader.HEIGHT,
        }}
      >
        <Image
          source={{ uri: croppedImage.uri }}
          style={{ width: 250, height: 250, borderRadius: 125 }}
        />
      </View>
    );
  }
}
