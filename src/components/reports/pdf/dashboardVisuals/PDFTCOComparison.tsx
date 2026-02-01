import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const options = [
  { name: "Current", value: 78, color: colors.textMuted },
  { name: "Option A", value: 64, color: colors.primary },
  { name: "Option B", value: 58, color: colors.primaryDark },
];

export const PDFTCOComparison = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>TCO Comparison</Text>
        <Text style={styles.dashboardSubtitle}>Relative lifecycle cost index (lower is better)</Text>
      </View>
    </View>

    <View style={styles.barContainer}>
      {options.map((item, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel}>{item.name}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { flex: item.value, backgroundColor: item.color }]} />
            <View style={{ flex: Math.max(0, 100 - item.value) }} />
          </View>
          <Text style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  </View>
);
