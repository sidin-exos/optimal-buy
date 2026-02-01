import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const stats = [
  { label: "On-time", value: "92%" },
  { label: "Quality", value: "4.3/5" },
  { label: "Risk", value: "Med" },
];

const metrics = [
  { name: "Cost Competitiveness", value: 72, color: colors.primary },
  { name: "Responsiveness", value: 66, color: colors.primaryDark },
  { name: "Compliance", value: 84, color: colors.success },
];

export const PDFSupplierScorecard = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Supplier Scorecard</Text>
        <Text style={styles.dashboardSubtitle}>Performance snapshot</Text>
      </View>
    </View>

    <View style={styles.statsRow}>
      {stats.map((s, i) => (
        <View key={i} style={styles.statItem}>
          <Text style={styles.statLabel}>{s.label}</Text>
          <Text style={styles.statValue}>{s.value}</Text>
        </View>
      ))}
    </View>

    <View style={styles.barContainer}>
      {metrics.map((item, i) => (
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
