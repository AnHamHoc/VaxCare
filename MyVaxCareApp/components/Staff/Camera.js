import { useNavigation } from "@react-navigation/native";
import { CameraView } from "expo-camera";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef } from "react";


const Camera = () => {

    const navigation = useNavigation();
    const isScanner = useRef(false);

    const handleQr = async (data) =>{
    if(!isScanner.current && data)
        isScanner.current = true;

        navigation.navigate('Confirm',{qrData: data});
    }
  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          handleQr(data);
        }}
      />
      {/* Overlay tạo ô quét */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.focusBox} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTop: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlayMiddle: {
    flexDirection: "row",
    width: "100%",
    height: 300, // chiều cao ô quét
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  focusBox: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: "red",
    backgroundColor: "transparent",
    borderRadius: 20,
  },
  overlayBottom: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default Camera;
