import jsPDF from 'jspdf';
import type { Invoice } from '@/types';

export const defaultTemplate = {
  margin: 20,
  lineHeight: 10,
  fontSize: {
    header: 20,
    subheader: 16,
    normal: 12,
    small: 10
  }
};

export const generateInvoicePDF = async (invoice: Invoice, template = defaultTemplate) => {
  const doc = new jsPDF();
  const { margin, lineHeight, fontSize } = template;

  // En-tête
  doc.setFontSize(fontSize.header);
  doc.text('FACTURE', margin, margin);

  // Numéro de facture et date
  doc.setFontSize(fontSize.normal);
  doc.text(`N° ${invoice.number}`, margin, margin + lineHeight * 2);
  doc.text(`Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}`, margin, margin + lineHeight * 3);

  // Informations client
  doc.setFontSize(fontSize.subheader);
  doc.text('Client', margin, margin + lineHeight * 5);
  doc.setFontSize(fontSize.normal);
  doc.text(`ID: ${invoice.companyId}`, margin, margin + lineHeight * 6);

  // Services
  doc.setFontSize(fontSize.subheader);
  doc.text('Services', margin, margin + lineHeight * 8);
  
  let y = margin + lineHeight * 9;
  invoice.services.forEach(service => {
    doc.setFontSize(fontSize.normal);
    doc.text(service.name, margin, y);
    doc.text(`${service.users.length} utilisateur(s)`, 100, y);
    doc.text(`${service.price.toFixed(2)}€`, 170, y);
    y += lineHeight;
  });

  // Total
  y += lineHeight * 2;
  doc.setFontSize(fontSize.subheader);
  doc.text('Total', 120, y);
  doc.text(`${invoice.totalAmount?.toFixed(2) || '0.00'}€`, 170, y);

  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(fontSize.small);
  doc.text('Cloudbizz - Solutions Cloud pour Entreprise', margin, pageHeight - margin);

  return doc;
};