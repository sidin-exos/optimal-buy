import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

export const PDFKraljicQuadrant = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Kraljic Matrix</Text>
        <Text style={styles.dashboardSubtitle}>Supply risk vs business impact</Text>
      </View>
    </View>

    <View style={styles.quadrantGrid}>
      <View style={styles.quadrantRow}>
        <View style={[styles.quadrantCell]}>
          <Text style={styles.quadrantLabel}>Strategic</Text>
          <View style={[styles.quadrantDot, { backgroundColor: colors.destructive }]} />
        </View>
        <View style={[styles.quadrantCell, styles.quadrantCellLastCol]}>
          <Text style={styles.quadrantLabel}>Bottleneck</Text>
          <View style={[styles.quadrantDot, { backgroundColor: colors.warning }]} />
        </View>
      </View>
      <View style={styles.quadrantRow}>
        <View style={[styles.quadrantCell, styles.quadrantCellLastRow]}>
          <Text style={styles.quadrantLabel}>Leverage</Text>
          <View style={[styles.quadrantDot, { backgroundColor: colors.primary }]} />
        </View>
        <View style={[styles.quadrantCell, styles.quadrantCellLastCol, styles.quadrantCellLastRow]}>
          <Text style={styles.quadrantLabel}>Non-critical</Text>
          <View style={[styles.quadrantDot, { backgroundColor: colors.textMuted }]} />
        </View>
      </View>
    </View>

    <View style={styles.legend}>
      <Text style={styles.legendText}>
        (Vector quadrant view; positioning is indicative)
      </Text>
    </View>
  </View>
);
