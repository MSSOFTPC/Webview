import { BackHandler, Dimensions, StyleSheet, Text, ToastAndroid, useWindowDimensions, View, Linking } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import Splash from './Splash';

export default function App() {
  const { height, width } = Dimensions.get("screen");
  const [percentage, setpercentage] = useState<number>(10);
  const [showSplash, setshowSplash] = useState<boolean>(true);
  const [uri, setUri] = useState<string>(`https://www.sidcofoods.ae/`);
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // OneSignal Init
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize('81673e45-2b6a-46d6-9534-83388d811779');
    OneSignal.Notifications.requestPermission(false);
    
    setTimeout(() => {
      setshowSplash(false);
    }, 3000);

    // Get Android Permissions
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  // Open Listener
  useEffect(() => {
    OneSignal.Notifications.addEventListener('click', (event) => {
      const url = event?.notification.additionalData?.appUrl;
      setUri(url);
    });
  }, []);

  useEffect(() => {
    let lastBackPressed = 0;

    const backAction = () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }

      const now = Date.now();
      if (lastBackPressed && now - lastBackPressed < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressed = now;
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  // WhatsApp link handler
  const handleShouldStartLoad = (request) => {
    const url = request.url;
    if (url.startsWith("whatsapp://") || url.includes("wa.me") || url.includes("api.whatsapp.com")) {
      Linking.openURL(url).catch(() => {
        ToastAndroid.show("WhatsApp not installed", ToastAndroid.SHORT);
      });
      return false; // Prevent WebView from loading this URL
    }
    return true; // Allow other URLs
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={{ height: height - 100, width }}>
          <WebView
            ref={webviewRef}
            paymentRequestEnabled
            geolocationEnabled
            onLoadProgress={({ nativeEvent }) => {
              setpercentage(Math.round(nativeEvent.progress * 100));
            }}
            userAgent="Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.131 Mobile Safari/537.36"
            pagingEnabled
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            pullToRefreshEnabled
            source={{ uri: uri?.startsWith("http") ? uri : "https://www.sidcofoods.ae/" }}
            javaScriptEnabled={true}
            style={{ flex: 1, paddingBottom: 100 }}
          />
        </View>
        {(percentage > 0 && percentage !== 100) && <View style={{ margin: "auto", width: `${percentage}%`, height: 2, backgroundColor: "red" }} />}
        {showSplash && <Splash />}
      </SafeAreaView>
    </SafeAreaProvider>
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
