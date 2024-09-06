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

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // Exemplo fictício de renderização da página em um canvas
    // Aqui a lógica de renderização do PDF deve ser adicionada.

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Detectar QR codes
    const qrCode1 = jsQR(imageData.data, canvas.width, canvas.height);
    if (qrCode1) {
        console.log('QR Code 1 encontrado: ', qrCode1.data);
    } else {
        console.log('QR Code 1 não encontrado.');
    }

    if (qrCode1) {
        await createNewPDF(pdfDoc, qrCode1.data, 'qr1.pdf');
    }

    const qrCode2 = jsQR(imageData.data, canvas.width, canvas.height);
    if (qrCode2) {
        await createNewPDF(pdfDoc, qrCode2.data, 'qr2.pdf');
    }
}

async function createNewPDF(pdfDoc, qrData, fileName) {
    const newPdf = await PDFLib.PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [0]);

    newPdf.addPage(copiedPage);

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