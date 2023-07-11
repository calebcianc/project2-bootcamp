import { useState, useEffect } from "react";
import XLSX, { writeFile } from "xlsx";
import ExcelJS from "exceljs";

export default function Export({
  showCheckboxes,
  setShowCheckboxes,
  selectedExpenses,
  setSelectedExpenses,
  selectedExpensesData,
  setSelectedExpensesData,
}) {
  const [counter, setCounter] = useState(0);

  function convertToWorkbook(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Add data rows
    data.forEach((row) => {
      const values = Object.values(row);
      worksheet.addRow(values);
    });

    return workbook;
  }

  async function handleExportClick() {
    if (showCheckboxes && selectedExpenses.length !== 0) {
      const workbook = convertToWorkbook(selectedExpensesData);
      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = "expenses_data.xlsx";

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // For IE browser
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
        // For other browsers
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }

      setShowCheckboxes(false);
      setSelectedExpenses([]);
      setSelectedExpensesData([]);
    } else if (showCheckboxes && selectedExpenses.length === 0) {
      setShowCheckboxes(false);
    } else {
      setShowCheckboxes(true);
    }
    setCounter(counter + 1);
  }

  return (
    <span
      style={{ margin: "0 5px", cursor: "pointer" }}
      onClick={() => handleExportClick()}
      title="Click to select and export expenses"
    >
      📤
    </span>
  );
}
