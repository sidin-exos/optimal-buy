import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const stats = [
  { label: "Coverage", value: "86%" },
  { label: "Completeness", value: "78%" },
  { label: "Confidence", value: "High" },
];

const fields = [
  { name: "Supplier list", value: 92 },
  { name: "Volumes", value: 81 },
  { name: "Pricing", value: 74 },
  { name: "Terms", value: 63 },
];

export const PDFDataQuality = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Data Quality</Text>
        <Text style={styles.dashboardSubtitle}>Input coverage and confidence</Text>
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
      {fields.map((item, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel}>{item.name}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  flex: item.value,
                  backgroundColor: item.value >= 80 ? colors.success : item.value >= 70 ? colors.warning : colors.destructive,
                },
              ]}
            />
            <View style={{ flex: Math.max(0, 100 - item.value) }} />
          </View>
          <Text style={styles.barValue}>{item.value}%</Text>
        </View>
      ))}
    </View>
  </View>
);
