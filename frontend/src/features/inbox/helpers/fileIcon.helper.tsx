import {
  FileExclamationOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";
export const getFileIcon = (mimeType: string, filename: string): ReactNode => {
  const type = mimeType?.toLowerCase() || "";
  const name = filename?.toLowerCase() || "";
  if (type.includes("pdf") || name.endsWith(".pdf"))
    return <FilePdfOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />;
  if (type.includes("image") || name.match(/\.(jpg|jpeg|png|gif)$/))
    return <FileImageOutlined style={{ fontSize: "24px", color: "#52c41a" }} />;
  if (type.includes("word") || name.match(/\.(doc|docx)$/))
    return <FileWordOutlined style={{ fontSize: "24px", color: "#1890ff" }} />;
  if (
    type.includes("zip") ||
    type.includes("rar") ||
    name.match(/\.(zip|rar|7z)$/)
  )
    return <FileZipOutlined style={{ fontSize: "24px", color: "#faad14" }} />;
  if (type.includes("text") || name.endsWith(".txt"))
    return <FileTextOutlined style={{ fontSize: "24px", color: "#8c8c8c" }} />;
  return (
    <FileExclamationOutlined style={{ fontSize: "24px", color: "#595959" }} />
  );
};
