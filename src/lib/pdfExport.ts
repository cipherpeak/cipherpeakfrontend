import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportSection {
    title: string;
    data: any[];
    columns?: string[];
}

export interface ExportOptions {
    orientation?: 'portrait' | 'landscape';
    filename?: string;
    mainTitle: string;
    subtitle?: string;
}

const addHeader = (doc: jsPDF, mainTitle: string, subtitle?: string) => {
    const pageWidth = doc.internal.pageSize.width;

    // Header Background
    doc.setFillColor(51, 51, 51);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Brand / Logo Placeholder
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CIPHER PEAK', 14, 25);

    // Report Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(mainTitle.toUpperCase(), 14, 34);

    // Right side info
    doc.setFontSize(10);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 50, 20);
    if (subtitle) {
        doc.text(`PERIOD: ${subtitle.toUpperCase()}`, pageWidth - 50, 26);
    }
};

const addFooter = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const pageCount = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.setDrawColor(200);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        doc.text(`© ${new Date().getFullYear()} Cipher Peak | Business Intelligence Report`, 14, pageHeight - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }
};

export const exportDetailedReportToPDF = (sections: ReportSection[], options: ExportOptions) => {
    const { orientation = 'portrait', filename = 'Report', mainTitle, subtitle } = options;

    const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
    });

    addHeader(doc, mainTitle, subtitle);

    let currentY = 55;

    sections.forEach((section, index) => {
        if (!section.data || section.data.length === 0) return;

        // Check if we need a new page for the next section
        if (currentY > (orientation === 'landscape' ? 160 : 250)) {
            doc.addPage();
            currentY = 20;
        }

        // Section Title
        doc.setFontSize(16);
        doc.setTextColor(51, 51, 51);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 14, currentY);

        // Underline section title
        const titleWidth = doc.getTextWidth(section.title);
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(1);
        doc.line(14, currentY + 2, 14 + titleWidth, currentY + 2);

        currentY += 10;

        const headers = section.columns || Object.keys(section.data[0]);
        const body = section.data.map(row => headers.map(header => {
            const value = row[header];
            if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value);
            }
            return value === null || value === undefined ? '-' : String(value);
        }));

        autoTable(doc, {
            startY: currentY,
            head: [headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
            body: body,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left'
            },
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            },
            margin: { left: 14, right: 14 },
            columnStyles: {
                // Essential columns get minimal width, rest auto
                status: { halign: 'center', fontStyle: 'bold' }
            }
        });

        // Update currentY for next section
        // @ts-ignore
        currentY = (doc as any).lastAutoTable.finalY + 15;
    });

    addFooter(doc);
    doc.save(`${filename}.pdf`);
};

// Simple export compatible with previous call signature
export const exportToPDF = (data: any[], filename: string, title: string) => {
    exportDetailedReportToPDF([{ title: 'Details', data }], {
        filename,
        mainTitle: title,
        orientation: data && Object.keys(data[0] || {}).length > 8 ? 'landscape' : 'portrait'
    });
};
