
# Financial Identifiers & False Positive Protection

## Overview

Harden the Anonymizer for B2B financial documents by adding:
1. **Financial Entity Detection** - IBAN, Credit Card, and Tax ID patterns
2. **Exclusion List** - Prevent over-anonymization of common business terms

---

## Part 1: New Financial Entity Types

### Type Definition Updates

**File:** `src/lib/sentinel/types.ts` (Line 14)

Add three new entity types to the union:

```typescript
type: 'company' | 'person' | 'price' | 'contract' | 'location' | 'date' | 'percentage' | 'email' | 'phone' | 'iban' | 'credit_card' | 'tax_id' | 'custom';
```

### New Patterns

**File:** `src/lib/sentinel/anonymizer.ts`

Add to `ENTITY_PATTERNS`:

| Entity | Pattern | Token Prefix | Notes |
|--------|---------|--------------|-------|
| IBAN | `/[A-Z]{2}\d{2}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{0,8}\|[A-Z]{2}\d{2}[A-Z0-9]{10,30}/g` | `BANK_ACCT` | Space-separated and continuous formats |
| Credit Card | `/(?:4[0-9]{12}(?:[0-9]{3})?\|5[1-5][0-9]{14}\|3[47][0-9]{13}\|6(?:011\|5[0-9]{2})[0-9]{12})/g` | `CC_NUM` | Visa, MC, Amex, Discover |
| Tax ID | `/\b[A-Z]{2}[0-9A-Z]{8,12}\b\|\b[1-9]\d?-\d{7}\b/g` | `TAX_ID` | EU VAT and US EIN formats |

### Token Prefix Additions

Add to `TOKEN_PREFIXES`:

```typescript
iban: 'BANK_ACCT',
credit_card: 'CC_NUM',
tax_id: 'TAX_ID',
```

---

## Part 2: Exclusion List (Allowlist)

### Problem

Current patterns may incorrectly match common business terms:
- "Invoice" could match capitalized word patterns
- "Agreement" looks like a company name
- "Manager" followed by a name gets partially masked

### Solution

Create a case-insensitive Set of protected terms that should never be masked.

### Implementation

**File:** `src/lib/sentinel/anonymizer.ts`

Add constant after `TOKEN_PREFIXES`:

```typescript
const COMMON_BUSINESS_TERMS = new Set([
  'invoice', 'contract', 'agreement', 'total', 'subtotal',
  'date', 'vendor', 'supplier', 'client', 'manager',
  'director', 'chief', 'officer', 'bank', 'swift',
  'iban', 'payment', 'due', 'amount', 'reference',
  'purchase', 'order', 'quote', 'proposal', 'estimate',
  'receipt', 'statement', 'balance', 'credit', 'debit',
  'tax', 'vat', 'net', 'gross', 'fee', 'charge',
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
  'saturday', 'sunday'
]);
```

### Integration Point

Modify the `anonymize()` function matching loop (around line 184-193):

```typescript
while ((match = pattern.exec(text)) !== null) {
  // Avoid duplicates and very short matches
  if (match[0].length < 3) continue;
  
  // NEW: Skip common business terms (false positive protection)
  if (COMMON_BUSINESS_TERMS.has(match[0].toLowerCase())) continue;
  
  allMatches.push({
    type: entityType,
    value: match[0],
    index: match.index,
    length: match[0].length,
  });
}
```

---

## Part 3: Configuration Updates

### Default Entity Types

Update `DEFAULT_ANONYMIZATION_CONFIG` to include new types:

```typescript
entityTypes: ['company', 'person', 'price', 'contract', 'email', 'phone', 'iban', 'credit_card', 'tax_id'],
```

### Confidence Scoring Update

Add financial data to "Missing Actor" penalty logic:

```typescript
const hasTransaction = types.has('contract') || types.has('price') || types.has('iban') || types.has('credit_card');
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/sentinel/types.ts` | Add `'iban' \| 'credit_card' \| 'tax_id'` to entity type union |
| `src/lib/sentinel/anonymizer.ts` | Add patterns, prefixes, exclusion list, update matching loop, update config |

---

## Test Cases

### Financial Entity Detection

| Input | Expected Output |
|-------|-----------------|
| `Payment to IBAN DE89 3704 0044 0532 0130 00` | `Payment to [BANK_ACCT_A]` |
| `IBAN: GB82WEST12345698765432` | `IBAN: [BANK_ACCT_A]` |
| `Card: 4111111111111111` | `Card: [CC_NUM_A]` |
| `VAT number GB123456789` | `VAT number [TAX_ID_A]` |
| `EIN: 12-3456789` | `EIN: [TAX_ID_A]` |

### False Positive Protection

| Input | Expected Output | Reason |
|-------|-----------------|--------|
| `Please sign the Agreement` | `Please sign the Agreement` | "Agreement" is protected |
| `Manager: John Doe` | `Manager: [CONTACT_A]` | "Manager" protected, "John Doe" masked |
| `Invoice #12345` | `Invoice #12345` | "Invoice" protected (but contract pattern may catch full ref) |
| `Total amount due` | `Total amount due` | All three words protected |

---

## Technical Notes

- **Pattern Priority**: Financial patterns (IBAN, CC) are highly specific and should match before general numeric patterns
- **IBAN Validation**: Pattern is structural only; Luhn check not implemented (acceptable for anonymization use case)
- **Credit Card**: Pattern covers major card types (Visa, MC, Amex, Discover) - simplified version without separators for safety
- **Exclusion List**: Case-insensitive matching via `.toLowerCase()` before Set lookup
- **Performance**: Set lookup is O(1), minimal impact on processing time
