import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RANGE_LABELS = {
  all: 'All Time',
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
};

const getRangeDuration = (rangeType, expenses) => {
  if (!expenses.length) return 'No data';

  if (rangeType === 'daily') {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (rangeType === 'weekly') {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    return `${monday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  if (rangeType === 'monthly') {
    return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  // 'all' — show first to last date in the data
  const dates = expenses.map((e) => new Date(e.createdAt));
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));
  return `${earliest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – ${latest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

export const exportExpensesToPdf = (expenses, rangeType = 'all', username = 'User') => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [79, 70, 229];   // indigo-600
  const accentColor = [245, 158, 11];   // amber-500
  const darkGray = [31, 41, 55];
  const midGray = [107, 114, 128];
  const lightGray = [249, 250, 251];

  // ── Header band ─────────────────────────────────────────────
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Expense Tracker', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Personal Expense Report', 14, 18);

  // Premium badge
  doc.setFillColor(...accentColor);
  doc.roundedRect(pageWidth - 38, 8, 24, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('★ PREMIUM', pageWidth - 36, 13.5);

  // ── Report info block ────────────────────────────────────────
  doc.setTextColor(...darkGray);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const rangeLabel = RANGE_LABELS[rangeType] || 'Report';
  doc.text(`${rangeLabel} Report`, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...midGray);
  doc.text(`Duration: ${getRangeDuration(rangeType, expenses)}`, 14, 45);
  doc.text(
    `Generated for: ${username}   |   Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    14, 51
  );

  // Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, 55, pageWidth - 14, 55);

  // ── Summary cards ────────────────────────────────────────────
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const categoryBreakdown = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
    return acc;
  }, {});
  const topCategory =
    Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const cardY = 59;
  const cardHeight = 16;
  const cardWidth = (pageWidth - 28 - 8) / 3;

  [
    { label: 'Total Expenses', value: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'No. of Entries', value: String(expenses.length) },
    { label: 'Top Category', value: topCategory },
  ].forEach((card, i) => {
    const x = 14 + i * (cardWidth + 4);
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(220, 222, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...midGray);
    doc.text(card.label, x + 4, cardY + 5.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text(card.value, x + 4, cardY + 12.5);
  });

  // ── Expense table ────────────────────────────────────────────
  const tableRows = expenses.map((e) => [
    new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    e.description.length > 40 ? e.description.slice(0, 38) + '…' : e.description,
    e.category,
    `₹${parseFloat(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: cardY + cardHeight + 6,
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: tableRows,
    foot: [['', '', 'Total', `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]],
    showFoot: 'lastPage',
    theme: 'plain',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: darkGray,
      cellPadding: 3.5,
    },
    footStyles: {
      fillColor: [238, 242, 255],
      textColor: primaryColor,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 249, 252],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 32 },
      3: { cellWidth: 30, halign: 'right' },
    },
    tableLineColor: [220, 222, 230],
    tableLineWidth: 0.2,
    margin: { left: 14, right: 14 },
  });

  // ── Footer on every page ─────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...midGray);
    doc.text(
      `Page ${i} of ${pageCount}  |  AI Expense Tracker  |  Generated ${new Date().toLocaleDateString('en-IN')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`expense-report-${rangeType}-${Date.now()}.pdf`);
};