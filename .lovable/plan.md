

# Font Comparison — Generate 3 Sample PDF Pages

## Approach

Create a temporary **Font Preview** utility that generates 3 mini PDF documents — one per font option — using `@react-pdf/renderer`. Each PDF will contain a sample EXOS report page (header, executive summary bullet, dashboard card snippet, footer) rendered with the candidate font combination. The user downloads all 3 and compares side-by-side.

## The 3 Font Options

| Option | Headers | Body Text | Data/Tables |
|---|---|---|---|
| **A: Helvetica Pure** | Helvetica-Bold | Helvetica | Helvetica |
| **B: Helvetica + Times** | Helvetica-Bold | Times-Roman | Times-Roman |
| **C: Helvetica + Courier Data** | Helvetica-Bold | Helvetica | Courier (numbers/tables only) |

## Implementation

### New file: `src/components/reports/pdf/FontPreviewGenerator.tsx`

- Creates 3 `<Document>` components, each using one font combo
- Each document = 1 page with:
  - EXOS header (logo + brand)
  - Sample section title + 3 bullet points of body text
  - A mini table (supplier name, score, spend) to show data font
  - Footer
- All on the dark navy background with teal accents (matching current theme)
- Exports a React component with 3 "Download Sample A/B/C" buttons
- Each button calls `pdf(doc).toBlob()` and triggers download

### Temporary route or modal trigger

- Add a small "Preview Fonts" button on the `/report` page (next to export buttons)
- Opens a dialog with the 3 download buttons
- Will be removed after the user picks a font

## Files Changed

| # | File | Action | Summary |
|---|---|---|---|
| 1 | `src/components/reports/pdf/FontPreviewGenerator.tsx` | Create | 3 sample PDF documents with different font combos + download buttons |
| 2 | `src/pages/GeneratedReport.tsx` | Edit | Add temporary "Preview Fonts" button that opens the font preview dialog |

## Cleanup

After user picks a font, we remove `FontPreviewGenerator.tsx` and the temporary button, then apply the chosen font to `PDFReportDocument.tsx` and the dashboard visual theme.

