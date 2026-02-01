import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const sensitivityData = [
  { name: "Material Cost", lowPct: 35, highPct: 40, impact: "±$70K" },
  { name: "Labor Rate", lowPct: 20, highPct: 25, impact: "±$45K" },
  { name: "Volume", lowPct: 25, highPct: 20, impact: "±$20K" },
  { name: "Exchange Rate", lowPct: 18, highPct: 15, impact: "±$15K" },
  { name: "Overhead %", lowPct: 12, highPct: 18, impact: "±$10K" },
];

export const PDFSensitivityAnalysis = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Sensitivity Analysis</Text>
        <Text style={styles.dashboardSubtitle}>Impact of variable changes on total cost</Text>
      </View>
    </View>
    <View style={{ marginTop: 8 }}>
      {sensitivityData.map((item, i) => (
        <View key={i} style={styles.tornadoRow}>
          <Text style={styles.tornadoLabel}>{item.name}</Text>
          <View style={styles.tornadoChart}>
            <View style={styles.tornadoLeft}>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <View style={{ flex: Math.max(0, 100 - item.lowPct) }} />
                <View
                  style={[
                    styles.tornadoBar,
                    {
                      flex: item.lowPct,
                      backgroundColor: item.lowPct > 20 ? colors.destructive : colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.tornadoCenter} />
            <View style={styles.tornadoRight}>
              <View style={{ width: "100%", flexDirection: "row" }}>
                <View
                  style={[
                    styles.tornadoBar,
                    {
                      flex: item.highPct,
                      backgroundColor: item.highPct > 20 ? colors.destructive : colors.primary,
                    },
                  ]}
                />
                <View style={{ flex: Math.max(0, 100 - item.highPct) }} />
              </View>
            </View>
          </View>
          <Text style={styles.tornadoValue}>{item.impact}</Text>
        </View>
      ))}
    </View>
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
        <Text style={styles.legendText}>Favorable</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.destructive }]} />
        <Text style={styles.legendText}>Unfavorable</Text>
      </View>
    </View>
  </View>
);
