import * as XLSX from "xlsx";

export const exportToexcel = (
  data,
  FileName = "transactions"
) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Transactions"
    );

    XLSX.writeFile(
      workbook,
      `${FileName}.xlsx`
    );

  } catch (error) {
    console.error("File doesn't download:", error);
  }
};  