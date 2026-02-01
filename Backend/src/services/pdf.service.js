import PDFDocument from "pdfkit";
import { generateUPIString, generateQRCodeDataURL } from "./qr.service.js";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

export const generateInvoicePDF = async (invoiceId) => {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      lines: { include: { product: true } },
    },
  });

  if (!invoice) throw new ApiError(404, "Invoice not found");

  const doc = new PDFDocument({ margin: 50 });

  // --- Header ---
  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice Number: ${invoice.number}`);
  doc.text(`Date: ${invoice.invoiceDate.toISOString().split("T")[0]}`);
  if (invoice.dueDate)
    doc.text(`Due Date: ${invoice.dueDate.toISOString().split("T")[0]}`);
  doc.moveDown();

  // --- Customer Details ---
  doc.text(`Bill To: ${invoice.customer.name}`);
  if (invoice.customer.email) doc.text(`Email: ${invoice.customer.email}`);
  if (invoice.customer.phone) doc.text(`Phone: ${invoice.customer.phone}`);
  doc.moveDown();

  // --- Table Header ---
  let y = doc.y;
  doc.font("Helvetica-Bold");
  doc.text("Product", 50, y);
  doc.text("Qty", 250, y);
  doc.text("Price", 350, y);
  doc.text("Total", 450, y);
  doc.font("Helvetica");
  doc.moveDown();

  // --- Table Rows ---
  invoice.lines.forEach((line) => {
    y = doc.y;
    doc.text(line.product.name, 50, y);
    doc.text(line.quantity.toString(), 250, y);
    doc.text(line.unitPrice.toString(), 350, y);
    doc.text(line.lineTotal.toString(), 450, y);
    doc.moveDown();
  });

  doc.moveDown();
  doc
    .font("Helvetica-Bold")
    .text(`Total Amount: ${invoice.total}`, { align: "right" });

  // --- QR Code ---
  // Assuming a default merchant VPA for demo purposes. In a real app, this should be config.
  const MERCHANT_VPA = "merchant@upi";
  const MERCHANT_NAME = "Shiv Furniture";

  if (Number(invoice.amountDue) > 0) {
    try {
      const upiString = generateUPIString({
        vpa: MERCHANT_VPA,
        name: MERCHANT_NAME,
        amount: invoice.amountDue,
        ref: invoice.number,
        notes: `Payment for ${invoice.number}`,
      });
      const qrDataUrl = await generateQRCodeDataURL(upiString);

      doc.moveDown();
      doc.text("Scan to Pay:", { align: "center" });
      doc.image(qrDataUrl, (doc.page.width - 100) / 2, doc.y, {
        fit: [100, 100],
        align: "center",
      });
    } catch (err) {
      console.error("QR Generation failed", err);
    }
  }

  doc.end();
  return doc;
};
