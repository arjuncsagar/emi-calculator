import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const getFormattedCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

export const formatRupeeSymbol = (amount) => {
    return amount.replace('₹', 'INR ');
}

export const exportToPDF = (tableData, headers) => {
    const doc = new jsPDF();

    const rows = tableData.map((item, ix) => [
        ix,
        item.month,
        formatRupeeSymbol(item.emi),
        formatRupeeSymbol(item.interest),
        formatRupeeSymbol(item.principal),
        formatRupeeSymbol(item.prepayment),
        formatRupeeSymbol(item.remainingPrincipal)
    ]);

    // Add table to the PDF
    autoTable(doc, {
        head: [headers],
        body: rows,
        columnStyles: {
            3: {halign: 'left', cellWidth: 'auto'},
            4: {halign: 'left', cellWidth: 'auto'},
            5: {halign: 'left', cellWidth: 'auto'},
            6: {halign: 'left', cellWidth: 'auto'}
        }
    });

    // Save the PDF
    doc.save('emi-breakups.pdf');
};
