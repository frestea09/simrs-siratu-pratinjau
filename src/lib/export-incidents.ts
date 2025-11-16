export async function exportIncidentsXlsx(
  rows: any[],
  filename = "rekap_insiden.xlsx"
) {
  const mod: any = await import("exceljs/dist/exceljs.min.js")
  const ExcelNS: any = (mod as any).Workbook ? mod : (mod as any).default
  const workbook = new ExcelNS.Workbook()
  const ws = workbook.addWorksheet("REKAP INSIDEN")

  // Header layout (two rows, with merged groups)
  ws.spliceRows(1, 0, [])

  // Merging the header cells to match the desired format
  ws.mergeCells("A1:A2") // No
  ws.mergeCells("B1:B2") // Laporan unit
  ws.mergeCells("C1:C2") // Ruangan
  ws.mergeCells("D1:D2") // Tanggal Kejadian
  ws.mergeCells("E1:E2") // Identitas Pasien
  ws.mergeCells("F1:F2") // Kronologi
  ws.mergeCells("G1:G2") // Tipe Insiden
  ws.mergeCells("H1:L1") // Kejadian (KPC, KNC, KTC, KTD, Sentinel)
  ws.mergeCells("M1:P1") // Risk Grading Matrix (Biru, Hijau, Kuning, Merah)
  ws.mergeCells("Q1:Q2") // Tindakan
  ws.mergeCells("R1:R2") // Rekomendasi

  // Adding values to merged headers
  ws.getCell("A1").value = "No"
  ws.getCell("B1").value = "Laporan unit"
  ws.getCell("C1").value = "Ruangan"
  ws.getCell("D1").value = "Tanggal Kejadian"
  ws.getCell("E1").value = "Identitas Pasien (Nama & No RM)"
  ws.getCell("F1").value = "Kronologi"
  ws.getCell("G1").value = "Tipe Insiden"
  ws.getCell("H1").value = "Kejadian"
  ws.getCell("M1").value = "Risk Grading Matrix"
  ws.getCell("H2").value = "KPC"
  ws.getCell("I2").value = "KNC"
  ws.getCell("J2").value = "KTC"
  ws.getCell("K2").value = "KTD"
  ws.getCell("L2").value = "Sentinel"
  ws.getCell("M2").value = "Biru"
  ws.getCell("N2").value = "Hijau"
  ws.getCell("O2").value = "Kuning"
  ws.getCell("P2").value = "Merah"

  ws.getCell("Q1").value = "Tindakan"
  ws.getCell("R1").value = "Rekomendasi"

  const borderThin = { style: "thin" as const, color: { argb: "FF000000" } }
  const headerFill = {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FFEFEFEF" },
  }
  const headerDarkFill = {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FF595959" },
  }
  const center = {
    vertical: "middle" as const,
    horizontal: "center" as const,
    wrapText: true,
  }

  const colorMap: Record<string, string> = {
    M: "FF00B0F0",
    N: "FF92D050",
    O: "FFFFFF00",
    P: "FFFF0000",
  }

  // First header row (dark)
  for (const addr of [
    "A1",
    "B1",
    "C1",
    "D1",
    "E1",
    "F1",
    "G1",
    "H1",
    "M1",
    "Q1",
    "R1",
  ]) {
    const c = ws.getCell(addr)
    c.alignment = center
    c.font = { bold: true, color: { argb: "FFFFFFFF" } }
    c.fill = headerDarkFill
    c.border = {
      top: borderThin,
      left: borderThin,
      bottom: borderThin,
      right: borderThin,
    }
  }

  // Second header row
  const headerRow2 = ws.getRow(2)
  headerRow2.eachCell((cell: any) => {
    cell.alignment = center
    cell.font = { bold: true }
    cell.fill = headerFill
    cell.border = {
      top: borderThin,
      left: borderThin,
      bottom: borderThin,
      right: borderThin,
    }
  })

  // Set severity colors for Risk Grading Matrix (Biru, Hijau, Kuning, Merah)
  for (const col of Object.keys(colorMap)) {
    const cell = ws.getCell(`${col}2`)
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorMap[col] },
    }
  }

  // Adjusting column widths based on the sample data and your requirements
  const widths = [
    4, 22, 18, 14, 36, 44, 20, 6, 6, 6, 6, 10, 10, 10, 10, 10, 30, 30,
  ]
  ws.columns = widths.map((w) => ({ width: w }))
  ws.getRow(1).height = 20
  ws.getRow(2).height = 24
  ws.getColumn(4).numFmt = "dd-mm-yyyy"

  // Add rows from your `rows` data
  rows.forEach((r, idx) => {
    const check = "✓"
    const isType = (t: string) => (r.type === t ? check : "")
    const isSeverity = (s: string) => (r.severity === s ? check : "")
    const patient = [r.patientName, r.medicalRecordNumber]
      .filter(Boolean)
      .join(" / ")
    const unit = r.relatedUnit || r.unit || ""
    const room = r.careRoom || ""
    const dateSrc = r.incidentDate || r.date
    const d = dateSrc ? new Date(dateSrc) : undefined
    const dd = d && !isNaN(d.getTime()) ? d : ""

    const row = ws.addRow([
      idx + 1,
      unit,
      room,
      dd,
      patient,
      r.chronology || "",
      r.incidentSubject || "",
      isType("KPC"),
      isType("KNC"),
      isType("KTC"),
      isType("KTD"),
      isType("Sentinel"),
      isSeverity("biru"),
      isSeverity("hijau"),
      isSeverity("kuning"),
      isSeverity("merah"),
      r.firstAction || "",
      r.followUpPlan || "",
    ])
    row.eachCell((cell: any) => {
      cell.border = {
        top: borderThin,
        left: borderThin,
        bottom: borderThin,
        right: borderThin,
      }
      if (typeof cell.value === "number") cell.alignment = center
      if (typeof cell.value === "string" && cell.value === check)
        cell.alignment = center
    })
  })

  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
