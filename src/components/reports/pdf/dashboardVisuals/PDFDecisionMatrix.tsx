import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const matrixCriteria = ["Total Cost", "Quality", "Delivery", "Risk", "Innovation"];
const matrixWeights = [30, 25, 20, 15, 10];
const matrixOptions = [
  { name: "Option A", scores: [4, 5, 3, 4, 3], total: 82 },
  { name: "Option B", scores: [5, 4, 4, 3, 4], total: 84 },
  { name: "Option C", scores: [3, 4, 5, 5, 5], total: 83 },
];

const getScoreBg = (score: number): string => {
  if (score >= 5) return colors.primary;
  if (score >= 4) return colors.primaryDark;
  if (score >= 3) return colors.warning;
  return colors.destructive;
};

export const PDFDecisionMatrix = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Decision Matrix</Text>
        <Text style={styles.dashboardSubtitle}>Weighted multi-criteria analysis</Text>
      </View>
    </View>
    <View style={styles.matrixContainer}>
      <View style={[styles.matrixRow, styles.matrixHeader]}>
        <Text style={[styles.matrixCell, styles.matrixCellLeft, { flex: 1.5 }]}>Criteria</Text>
        <Text style={styles.matrixCell}>Wt%</Text>
        {matrixOptions.map((opt, i) => (
          <Text key={i} style={styles.matrixCell}>
            {opt.name}
          </Text>
        ))}
      </View>

      {matrixCriteria.map((criterion, idx) => (
        <View key={idx} style={styles.matrixRow}>
          <Text style={[styles.matrixCell, styles.matrixCellLeft, { flex: 1.5 }]}>{criterion}</Text>
          <Text style={styles.matrixCell}>{matrixWeights[idx]}%</Text>
          {matrixOptions.map((opt, i) => (
            <View key={i} style={styles.matrixCell}>
              <View style={[styles.scoreCell, { backgroundColor: getScoreBg(opt.scores[idx]) }]}>
                <Text style={styles.scoreCellText}>{opt.scores[idx]}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      <View style={[styles.matrixRow, { borderBottomWidth: 0 }]}>
        <Text style={[styles.matrixCell, styles.matrixCellLeft, { flex: 1.5, fontWeight: 600 }]}>
          Weighted Score
        </Text>
        <Text style={styles.matrixCell}>100%</Text>
        {matrixOptions.map((opt, i) => (
          <Text
            key={i}
            style={[
              styles.matrixCell,
              { fontWeight: 700, color: opt.total === 84 ? colors.primary : colors.text },
            ]}
          >
            {opt.total}
          </Text>
        ))}
      </View>
    </View>
  </View>
);
