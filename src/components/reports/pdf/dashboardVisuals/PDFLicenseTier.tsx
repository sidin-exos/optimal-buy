import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const tiers = [
  { name: "Basic", value: 42, color: colors.textMuted },
  { name: "Standard", value: 38, color: colors.primaryDark },
  { name: "Premium", value: 20, color: colors.primary },
];

export const PDFLicenseTier = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>License Distribution</Text>
        <Text style={styles.dashboardSubtitle}>User tier allocation</Text>
      </View>
    </View>

    <View style={styles.barContainer}>
      {tiers.map((item, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel}>{item.name}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { flex: item.value, backgroundColor: item.color }]} />
            <View style={{ flex: Math.max(0, 100 - item.value) }} />
          </View>
          <Text style={styles.barValue}>{item.value}%</Text>
        </View>
      ))}
    </View>
  </View>
);
