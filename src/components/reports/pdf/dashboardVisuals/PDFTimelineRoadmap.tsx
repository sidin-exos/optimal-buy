import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const phases = [
  { name: "Discovery", pct: 20, meta: "Week 1–2", color: colors.primary },
  { name: "RFP / RFQ", pct: 30, meta: "Week 3–5", color: colors.primaryDark },
  { name: "Negotiation", pct: 25, meta: "Week 6–7", color: colors.warning },
  { name: "Award & Onboard", pct: 25, meta: "Week 8–9", color: colors.success },
];

export const PDFTimelineRoadmap = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Timeline Roadmap</Text>
        <Text style={styles.dashboardSubtitle}>Phases and indicative duration</Text>
      </View>
    </View>

    <View style={styles.barContainer}>
      {phases.map((p, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel}>{p.name}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { flex: p.pct, backgroundColor: p.color }]} />
            <View style={{ flex: Math.max(0, 100 - p.pct) }} />
          </View>
          <Text style={styles.barValue}>{p.meta}</Text>
        </View>
      ))}
    </View>
  </View>
);
