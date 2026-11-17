function escapeXml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function downloadExcel(filename: string, rows: Record<string, string | number>[]) {
  const source = rows.length ? rows : [{ Aviso: "Sin alumnos para este filtro" }];
  const headers = Object.keys(source[0]);
  const headerRow = `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join("")}</Row>`;
  const body = source
    .map((row) => {
      const cells = headers
        .map((header) => {
          const value = row[header as keyof typeof row];
          const numeric = typeof value === "number" && Number.isFinite(value);
          return `<Cell><Data ss:Type="${numeric ? "Number" : "String"}">${numeric ? value : escapeXml(value)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Alumnos"><Table>${headerRow}${body}</Table></Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
