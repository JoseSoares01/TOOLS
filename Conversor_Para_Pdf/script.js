async function processPDF() {
    const input = document.getElementById('pdfInput').files[0];
    if (!input) {
        alert('Por favor, selecione um arquivo PDF.');
        return;
    }

    const arrayBuffer = await input.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    // Carregar a página onde os QR codes estão (exemplo com a página 1)
    const page = await pdfDoc.getPage(0);
    const { width, height } = page.getSize();

    // Criar canvas para renderizar a página
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // Renderizar a página em um canvas (aqui você deve implementar a renderização do PDF na página)
    // Aqui, usa-se uma abordagem fictícia. Use bibliotecas como PDF.js para isso.

    // Exemplo de imagem do canvas fictício
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Detectar QR codes
    const qrCode1 = jsQR(imageData.data, canvas.width, canvas.height);
    const qrCode2 = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });

    if (!qrCode1 || !qrCode2) {
        alert('Não foi possível detectar os QR codes.');
        return;
    }

    console.log('QR Code 1 encontrado:', qrCode1.data);
    console.log('QR Code 2 encontrado:', qrCode2.data);

    // Criar PDFs separados com os QR codes removidos
    await createPDFWithRemovedQRCode(pdfDoc, qrCode1, 'qr1_removed.pdf');
    await createPDFWithRemovedQRCode(pdfDoc, qrCode2, 'qr2_removed.pdf');
}

async function createPDFWithRemovedQRCode(pdfDoc, qrCodeToRemove, fileName) {
    const newPdf = await PDFLib.PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [0]);
    const page = copiedPage;

    const { x, y, width, height } = qrCodeToRemove.location.topLeftCorner;

    // Remover a área do QR code do PDF (desenhar um retângulo branco para "apagar")
    page.drawRectangle({
        x: x - 10, // Pequena margem para garantir que o QR code seja coberto
        y: y - 10,
        width: width + 20,
        height: height + 20,
        color: PDFLib.rgb(1, 1, 1), // Cor branca
    });

    newPdf.addPage(page);

    const pdfBytes = await newPdf.save();
    download(pdfBytes, fileName, 'application/pdf');
}

function download(data, fileName, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}