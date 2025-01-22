import { Home } from "lucide-react-native";
import { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft, LayoutAnimationConfig } from "react-native-reanimated";
import AnimatedTabs from "./";

const tabs = [ "#FF005C", "#FFBD00", "#00B3E6", "#00CC96", "#FF005C" ];

export default function Header() {
  const [index, setIndex] = useState(0);
  return(
    <SafeAreaView style={[styles.container, {margin: 12, gap: 12}]}>
      <View style={{flexDirection: "row", alignItems: "center"}}>
        <Home size={24} color="#555" />
        <View 
          style={{
            flex: 1,
            alignItems: "flex-end"
          }}>
            <AnimatedTabs data={[
              {icon: "LifeBuoy", label: "Buoy"},
              {icon: "Fish", label: "Fresh fish"},
              {icon: "Sailboat", label: "Sail"},
              {icon: "Ship", label: "Ship it"},
              {icon: "ShipWheel", label: "Manage it"},
            ]} 
              onChange={(index) => {
                setIndex(index)
              }}
              selectedIndex={index}
            />
        </View>
      </View>
      <LayoutAnimationConfig skipEntering>
        <Animated.View 
          entering={FadeInRight.springify().stiffness(200).damping(80)}
          exiting={FadeOutLeft.springify().stiffness(200).damping(80)}
          style={{
            flex: 1, 
            backgroundColor: tabs[index],
            borderRadius: 12
          }}
          key={`tab-${index}`}
        />
      </LayoutAnimationConfig>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
