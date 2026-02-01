import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

// 5x5 grid with a few highlighted risks.
const size = 5;
const highlighted = new Set(["4-4", "3-5", "5-2", "2-4"]); // row-col (impact-prob)

const cellColor = (impact: number, prob: number) => {
  const score = impact * prob;
  if (score >= 16) return colors.destructive;
  if (score >= 10) return colors.warning;
  return colors.primary;
};

export const PDFRiskMatrix = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Risk Matrix</Text>
        <Text style={styles.dashboardSubtitle}>Probability × Impact assessment</Text>
      </View>
    </View>

    <View style={{ marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 6, overflow: "hidden" }}>
      {Array.from({ length: size }).map((_, r) => {
        const impact = size - r; // top row = high impact
        return (
          <View
            key={r}
            style={{ flexDirection: "row", borderBottomWidth: r === size - 1 ? 0 : 1, borderBottomColor: colors.border }}
          >
            {Array.from({ length: size }).map((__, c) => {
              const prob = c + 1;
              const key = `${impact}-${prob}`;
              const bg = highlighted.has(key) ? cellColor(impact, prob) : colors.surfaceLight;
              return (
                <View
                  key={c}
                  style={{
                    flex: 1,
                    height: 22,
                    backgroundColor: bg,
                    borderRightWidth: c === size - 1 ? 0 : 1,
                    borderRightColor: colors.border,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {highlighted.has(key) ? (
                    <Text style={{ fontSize: 7, fontWeight: 700, color: colors.background }}>R</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>

    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
        <Text style={styles.legendText}>Low</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
        <Text style={styles.legendText}>Medium</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.destructive }]} />
        <Text style={styles.legendText}>High</Text>
      </View>
    </View>
  </View>
);
