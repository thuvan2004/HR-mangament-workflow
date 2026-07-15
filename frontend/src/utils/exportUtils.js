import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export data to PDF
 * @param {Array} data - Array of objects
 * @param {Array} columns - Array of column headers
 * @param {String} title - Title of the PDF document
 * @param {String} filename - Name of the output file
 */
export const exportToPDF = (data, columns, title = 'Report', filename = 'report.pdf') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  const tableData = data.map(row => columns.map(col => row[col.key] || ''));

  doc.autoTable({
    startY: 36,
    head: [columns.map(col => col.label)],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241] }, // Indigo-500
    styles: { fontSize: 9, cellPadding: 3 },
  });

  doc.save(filename);
};

/**
 * Export data to Excel
 * @param {Array} data - Array of objects
 * @param {String} filename - Name of the output file
 */
export const exportToExcel = (data, filename = 'report.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  XLSX.writeFile(workbook, filename);
};
