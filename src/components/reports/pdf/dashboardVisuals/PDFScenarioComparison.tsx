import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const criteria = [
  { name: "Cost", a: 82, b: 74 },
  { name: "Risk", a: 68, b: 77 },
  { name: "Speed", a: 71, b: 63 },
  { name: "Quality", a: 79, b: 73 },
  { name: "Flex", a: 66, b: 70 },
];

export const PDFScenarioComparison = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Scenario Comparison</Text>
        <Text style={styles.dashboardSubtitle}>Score-by-criterion (0–100)</Text>
      </View>
    </View>

    <View style={styles.matrixContainer}>
      <View style={[styles.matrixRow, styles.matrixHeader]}>
        <Text style={[styles.matrixCell, styles.matrixCellLeft, { flex: 1.4 }]}>Criterion</Text>
        <Text style={styles.matrixCell}>Scenario A</Text>
        <Text style={styles.matrixCell}>Scenario B</Text>
      </View>
      {criteria.map((c, i) => (
        <View key={i} style={styles.matrixRow}>
          <Text style={[styles.matrixCell, styles.matrixCellLeft, { flex: 1.4 }]}>{c.name}</Text>
          <Text style={styles.matrixCell}>{c.a}</Text>
          <Text style={styles.matrixCell}>{c.b}</Text>
        </View>
      ))}
    </View>

    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
        <Text style={styles.legendText}>Higher is better</Text>
      </View>
    </View>
  </View>
);
