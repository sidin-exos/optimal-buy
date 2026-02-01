import { View, Text } from "@react-pdf/renderer";
import { colors, styles } from "./theme";

const steps = [
  { label: "Prep", meta: "BATNA / targets" },
  { label: "Opening", meta: "Frame value" },
  { label: "Anchoring", meta: "Initial offer" },
  { label: "Concessions", meta: "Trade-offs" },
  { label: "Close", meta: "Terms & timeline" },
];

export const PDFNegotiationPrep = () => (
  <View style={styles.dashboardCard}>
    <View style={styles.dashboardHeader}>
      <View style={styles.dashboardIcon} />
      <View>
        <Text style={styles.dashboardTitle}>Negotiation Prep</Text>
        <Text style={styles.dashboardSubtitle}>Recommended sequencing</Text>
      </View>
    </View>

    <View style={{ marginTop: 10 }}>
      {steps.map((s, i) => (
        <View key={i} style={styles.listRow}>
          <View style={[styles.listDot, { backgroundColor: i === 0 ? colors.primary : colors.surfaceLight }]} />
          <Text style={styles.listText}>{`${i + 1}. ${s.label}`}</Text>
          <Text style={styles.listMeta}>{s.meta}</Text>
        </View>
      ))}
    </View>

    <View style={styles.legend}>
      <Text style={styles.legendText}>Use as a guide; adjust for stakeholder constraints.</Text>
    </View>
  </View>
);
