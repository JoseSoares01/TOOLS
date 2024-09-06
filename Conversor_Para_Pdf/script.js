async function processPDF() {
    const input = document.getElementById('pdfInput').files[0];
    if (!input) {
        alert('Por favor, selecione um arquivo PDF.');
        return;
    }

    const fileReader = new FileReader();

    fileReader.onload = function() {
        const typedArray = new Uint8Array(this.result);

        // Usar PDF.js para carregar e renderizar o PDF
        const loadingTask = pdfjsLib.getDocument(typedArray);
        loadingTask.promise.then(function(pdf) {
            // Renderizar a primeira página do PDF
            pdf.getPage(1).then(function(page) {
                const scale = 1.5;
                const viewport = page.getViewport({ scale: scale });

                // Criar canvas para renderizar o PDF
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                // Renderizar a página no canvas
                page.render(renderContext).promise.then(function() {
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                    // Detectar QR codes na imagem renderizada
                    const qrCode1 = jsQR(imageData.data, canvas.width, canvas.height);
                    const qrCode2 = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });

                    if (qrCode1) {
                        console.log('QR Code 1 encontrado:', qrCode1.data);
                    }
                    if (qrCode2) {
                        console.log('QR Code 2 encontrado:', qrCode2.data);
                    }

                    if (qrCode1 || qrCode2) {
                        createPDFWithRemovedQRCode(pdf, qrCode1, qrCode2);
                    } else {
                        alert('Nenhum QR code encontrado.');
                    }
                });
            });
        });
    };

    fileReader.readAsArrayBuffer(input);
}

async function createPDFWithRemovedQRCode(pdfDoc, qrCode1, qrCode2) {
    const newPdf = await PDFLib.PDFDocument.create();

    // Copiar a primeira página do documento original
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [0]);
    const page = copiedPage;

    // Remover o primeiro QR code (desenhar um retângulo branco sobre ele)
    if (qrCode1) {
        const { x, y, width, height } = qrCode1.location.topLeftCorner;
        page.drawRectangle({
            x: x - 10,
            y: y - 10,
            width: width + 20,
            height: height + 20,
            color: PDFLib.rgb(1, 1, 1), // Branco
        });
    }

    // Adicionar a página ao novo PDF
    newPdf.addPage(page);

    const pdfBytes = await newPdf.save();
    download(pdfBytes, 'pdf_with_qr1_removed.pdf', 'application/pdf');

    // Gerar segundo PDF com o segundo QR code removido
    const newPdf2 = await PDFLib.PDFDocument.create();
    const [copiedPage2] = await newPdf2.copyPages(pdfDoc, [0]);
    const page2 = copiedPage2;

    if (qrCode2) {
        const { x, y, width, height } = qrCode2.location.topLeftCorner;
        page2.drawRectangle({
            x: x - 10,
            y: y - 10,
            width: width + 20,
            height: height + 20,
            color: PDFLib.rgb(1, 1, 1), // Branco
        });
    }

    newPdf2.addPage(page2);

    const pdfBytes2 = await newPdf2.save();
    download(pdfBytes2, 'pdf_with_qr2_removed.pdf', 'application/pdf');
}

function download(data, fileName, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}