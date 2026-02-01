import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const tasks = [
  { task: "Confirm scope & stakeholders", status: "Done", color: colors.success },
  { task: "Collect supplier quotes", status: "In progress", color: colors.warning },
  { task: "Validate demand forecast", status: "In progress", color: colors.warning },
  { task: "Model savings scenarios", status: "To do", color: colors.textMuted },
  { task: "Align legal terms", status: "To do", color: colors.textMuted },
  { task: "Finalize award recommendation", status: "To do", color: colors.textMuted },
];

export const PDFActionChecklist = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Action Checklist</Text>
        <Text style={styles.dashboardSubtitle}>Priority tasks & current status</Text>
      </View>
    </View>

    <View style={{ marginTop: 8 }}>
      {tasks.map((t, i) => (
        <View key={i} style={styles.listRow}>
          <View style={[styles.listDot, { backgroundColor: t.color }]} />
          <Text style={styles.listText}>{t.task}</Text>
          <Text style={styles.listMeta}>{t.status}</Text>
        </View>
      ))}
    </View>

    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
        <Text style={styles.legendText}>Done</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
        <Text style={styles.legendText}>In progress</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.textMuted }]} />
        <Text style={styles.legendText}>To do</Text>
      </View>
    </View>
  </View>
);
