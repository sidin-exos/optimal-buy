import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const costBreakdownData = [
  { name: "Materials", value: 45, color: colors.textMuted },
  { name: "Labor", value: 25, color: colors.textMuted },
  { name: "Overhead", value: 17, color: colors.textMuted },
  { name: "Logistics", value: 6, color: colors.textMuted },
  { name: "Profit", value: 23, color: colors.warning },
];

export const PDFCostWaterfall = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Cost Breakdown</Text>
        <Text style={styles.dashboardSubtitle}>Component analysis (% of total)</Text>
      </View>
    </View>
    <View style={styles.barContainer}>
      {costBreakdownData.map((item, i) => (
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
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.textMuted }]} />
        <Text style={styles.legendText}>Cost Component</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
        <Text style={styles.legendText}>Supplier Margin</Text>
      </View>
    </View>
  </View>
);
