import QRCode from "qrcode";

export const generateUPIString = ({ vpa, name, amount, ref, notes }) => {
  if (!vpa || !name) {
    throw new Error("VPA and Name are required for UPI QR");
  }
  const params = new URLSearchParams();
  params.append("pa", vpa);
  params.append("pn", name);
  if (amount) params.append("am", amount.toString());
  if (ref) params.append("tr", ref);
  params.append("cu", "INR");
  if (notes) params.append("tn", notes);

  return `upi://pay?${params.toString()}`;
};

export const generateQRCodeDataURL = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    throw new Error("Failed to generate QR Code");
  }
};
