import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const clauses = [
  { name: "IP Ownership", value: 80 },
  { name: "Limitation of Liability", value: 55 },
  { name: "Termination", value: 72 },
  { name: "Data Protection", value: 66 },
  { name: "SLAs", value: 61 },
];

export const PDFSOWAnalysis = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>SOW Analysis</Text>
        <Text style={styles.dashboardSubtitle}>Clause coverage score (0–100)</Text>
      </View>
    </View>

    <View style={styles.barContainer}>
      {clauses.map((item, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel}>{item.name}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  flex: item.value,
                  backgroundColor: item.value >= 70 ? colors.success : item.value >= 60 ? colors.warning : colors.destructive,
                },
              ]}
            />
            <View style={{ flex: Math.max(0, 100 - item.value) }} />
          </View>
          <Text style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  </View>
);
