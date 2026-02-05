
# Contextual Company Detection and Dynamic Confidence Scoring

## Overview

Upgrade the Anonymizer in `src/lib/sentinel/anonymizer.ts` with two key improvements:
1. **Smarter company detection** that catches informal names and B2B context patterns
2. **Dynamic confidence scoring** that reflects real analysis quality

---

## Part 1: Enhanced Company Detection Patterns

### Current State

The existing `company` patterns only detect:
- Capitalized words with legal suffixes: `Acme Corp`, `TechVentures LLC`
- All-caps names: `IBM`, `SAP`

### Gap Analysis

| Input | Currently Detected? | Should Detect? |
|-------|---------------------|----------------|
| `acme ltd` | No | Yes |
| `nvidia gmbh` | No | Yes |
| `Vendor: TechSolutions` | No | Yes |
| `Supplier: nexgen` | No | Yes |

### New Patterns to Add

**Pattern 1: Case-Insensitive Legal Suffixes**

Detects any word(s) followed by a legal suffix, regardless of capitalization.

```typescript
// Matches: "acme ltd", "nvidia GmbH", "tech solutions inc."
/\b[\w]+(?:\s+[\w]+)*\s+(?:Inc|LLC|Ltd|GmbH|Corp|Co|S\.A\.|NV|Pty|AG|PLC)\.?\b/gi
```

Key features:
- Case-insensitive flag (`i`) allows matching lowercase
- Supports multi-word names before suffix
- Handles optional trailing period

**Pattern 2: B2B Contextual Keyword Anchors**

Detects proper nouns immediately following procurement-specific labels.

```typescript
// Matches: "Vendor: TechSolutions", "Supplier: Acme Corp"
/(?<=(?:Vendor|Supplier|Client|Partner|Counterparty|Customer|Contractor|Subcontractor):\s*)[\w]+(?:\s+[\w]+)*/gi
```

Key features:
- Positive lookbehind for B2B keywords
- Captures one or more words after the colon
- Case-insensitive for flexibility

### Pattern Priority

The existing capitalized patterns remain first (most precise), new patterns added after:

```text
1. Capitalized + suffix (existing) - highest precision
2. All-caps names (existing)
3. Case-insensitive suffix (new) - catches lowercase
4. Contextual anchors (new) - catches unlabeled names
```

---

## Part 2: Dynamic Confidence Scoring

### Current State

```typescript
confidence: entityMap.size > 0 ? 0.85 : 1.0
```

This static approach does not reflect actual analysis quality.

### New Heuristic Function

Create `calculateConfidence()` that applies context-aware penalties:

```text
+---------------------------+-------------------------------------------+---------+
| Penalty Name              | Condition                                 | Impact  |
+---------------------------+-------------------------------------------+---------+
| Low Density               | text.length > 500 AND entities < 2        | -0.15   |
| Missing Actor             | (contract OR price found) AND             | -0.20   |
|                           | (NO company AND NO person)                |         |
| PII Mismatch              | email found AND NO person                 | -0.05   |
+---------------------------+-------------------------------------------+---------+
```

### Function Signature

```typescript
function calculateConfidence(
  text: string,
  entityMap: Map<string, SensitiveEntity>
): number {
  let confidence = 1.0;
  
  // Extract entity types present
  const types = new Set([...entityMap.values()].map(e => e.type));
  
  // Low Density Penalty
  if (text.length > 500 && entityMap.size < 2) {
    confidence -= 0.15;
  }
  
  // Missing Actor Penalty
  const hasTransaction = types.has('contract') || types.has('price');
  const hasActor = types.has('company') || types.has('person');
  if (hasTransaction && !hasActor) {
    confidence -= 0.20;
  }
  
  // PII Mismatch Penalty
  if (types.has('email') && !types.has('person')) {
    confidence -= 0.05;
  }
  
  // Clamp between 0.1 and 1.0
  return Math.max(0.1, Math.min(1.0, confidence));
}
```

### Integration Point

Update line 231 in `anonymize()`:

```typescript
// Before
confidence: entityMap.size > 0 ? 0.85 : 1.0,

// After
confidence: calculateConfidence(text, entityMap),
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/sentinel/anonymizer.ts` | Add 2 new company patterns, add `calculateConfidence()` function, update return statement |

---

## Test Cases

### Company Detection

| Input | Expected Token |
|-------|----------------|
| `invoice for acme ltd` | `[SUPPLIER_A]` for "acme ltd" |
| `Vendor: TechSolutions` | `[SUPPLIER_A]` for "TechSolutions" |
| `nvidia gmbh contract` | `[SUPPLIER_A]` for "nvidia gmbh" |
| `Supplier: NextGen Systems` | `[SUPPLIER_A]` for "NextGen Systems" |

### Confidence Scoring

| Scenario | Expected Score |
|----------|----------------|
| Empty text, no entities | 1.0 |
| Short text with 1 company | 1.0 |
| 600 chars with only 1 price ($500) | 0.65 (low density + missing actor) |
| Email without person name | 0.95 |
| Contract + price but no company | 0.80 |

---

## Technical Notes

- **Lookbehind Support**: Modern browsers and Node.js 10+ support positive lookbehind. Edge functions (Deno) also support this.
- **Pattern Order**: New patterns appended after existing ones to preserve current behavior for well-formatted text.
- **No Breaking Changes**: Existing capitalized company detection remains primary; new patterns act as fallbacks.
