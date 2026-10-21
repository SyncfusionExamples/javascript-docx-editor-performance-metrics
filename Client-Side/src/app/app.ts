import {
    DocumentEditorContainer,
    Toolbar,
    Ribbon
} from '@syncfusion/ej2-documenteditor';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { Button } from '@syncfusion/ej2-buttons';

DocumentEditorContainer.Inject(
    Toolbar,
    Ribbon
);

new DropDownList({
dataSource: [
{ text: '50 Pages', value: 'Getting Started50.docx' },
{ text: '100 Pages', value: 'Getting Started100.docx' },
{ text: '200 Pages', value: 'Getting Started200.docx' },
{ text: '500 Pages', value: 'Getting Started500.docx' }
],
fields: {
text: 'text',
value: 'value'
},
value: 'Getting Started50.docx',
width: '180px',
change: (args) => {
selectedFile = args.value as string;
}
}).appendTo('#documentSize');

new Button({
    cssClass: 'e-primary'
}).appendTo('#loadBtn');

new Button().appendTo('#destroyBtn');
new Button().appendTo('#downloadBtn');
new Button().appendTo('#rtfBtn');
new Button().appendTo('#htmlBtn');
new Button().appendTo('#pdfBtn');

const hostUrl = 'http://localhost:62870/api/documenteditor/';

let container: DocumentEditorContainer | null = null;


let selectedFile = 'Getting Started50.docx';

const metrics = {
    componentLoad: 0,
    documentOpen: 0,
    download: 0,
    rtfExport: 0,
    htmlExport: 0,
    pdfExport: 0
};

let componentStart = 0;

function updateMetrics(): void {

    (document.getElementById('componentLoad') as HTMLElement)
        .textContent = `${metrics.componentLoad} ms`;

    (document.getElementById('documentOpen') as HTMLElement)
        .textContent = `${metrics.documentOpen} ms`;

    (document.getElementById('download') as HTMLElement)
        .textContent = `${metrics.download} ms`;

    (document.getElementById('rtfExport') as HTMLElement)
        .textContent = `${metrics.rtfExport} ms`;

    (document.getElementById('htmlExport') as HTMLElement)
        .textContent = `${metrics.htmlExport} ms`;

    (document.getElementById('pdfExport') as HTMLElement)
        .textContent = `${metrics.pdfExport} ms`;
}

function loadEditor(): void {

    if (container) {
        loadDocument();
        return;
    }

    componentStart = performance.now();

    container = new DocumentEditorContainer({
        width: '100%',
        height: '100%',
        enableToolbar: true,
        toolbarMode: 'Ribbon',
        serviceUrl: hostUrl,

        created: () => {

            metrics.componentLoad =
                Math.round(
                    performance.now() -
                    componentStart
                );

            updateMetrics();

            loadDocument();
        }
    });

    container.appendTo('#container');

    document.getElementById('emptyState')!.style.display = 'none';
    document.getElementById('container')!.style.display = 'block';

    toggleButtons(true);
}

function destroyEditor(): void {

    if (!container) {
        return;
    }

    container.destroy();

    container = null;

    Object.assign(metrics, {
        componentLoad: 0,
        documentOpen: 0,
        download: 0,
        rtfExport: 0,
        htmlExport: 0,
        pdfExport: 0
    });

    updateMetrics();

    document.getElementById('emptyState')!.style.display = 'flex';
    document.getElementById('container')!.style.display = 'none';

    toggleButtons(false);
}

function downloadDocument(): void {

    if (!container) {
        return;
    }

    const start = performance.now();

    container.documentEditor.save(
        'Document',
        'Docx'
    );

    metrics.download =
        Math.round(
            performance.now() - start
        );

    updateMetrics();
}

async function loadDocument(): Promise<void> {

    if (!container) {
        return;
    }

    const start = performance.now();

    const response = await fetch(
        hostUrl + 'LoadBenchmarkDocument',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: selectedFile
            })
        });

    if (response.status === 200) {

        const sfdt =
            await response.text();

        container.documentEditor.open(sfdt);

        metrics.documentOpen =
            Math.round(
                performance.now() -
                start
            );

        updateMetrics();
    }
}
function downloadBlob(
    blob: Blob,
    fileName: string
): void {

    const url =
        window.URL.createObjectURL(blob);

    const a =
        document.createElement('a');

    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);
}

async function benchmarkRtf(): Promise<void> {

    if (!container) {
        return;
    }

    const start = performance.now();

    const sfdt =
        container.documentEditor.serialize();

    const response = await fetch(
        hostUrl + 'BenchmarkRtf',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: sfdt
            })
        });

    if (response.status === 200) {

        const blob =
            await response.blob();

        downloadBlob(
            blob,
            'Document.rtf'
        );

        metrics.rtfExport =
            Math.round(
                performance.now() -
                start
            );

        updateMetrics();
    }
}
async function benchmarkHtml(): Promise<void> {

    if (!container) {
        return;
    }

    const start = performance.now();

    const sfdt =
        container.documentEditor.serialize();

    const response = await fetch(
        hostUrl + 'BenchmarkHtml',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: sfdt
            })
        });

    if (response.status === 200) {

        const blob =
            await response.blob();

        downloadBlob(
            blob,
            'Document.html'
        );

        metrics.htmlExport =
            Math.round(
                performance.now() -
                start
            );

        updateMetrics();
    }
}
async function benchmarkPdf(): Promise<void> {

    if (!container) {
        return;
    }

    const start = performance.now();

    const sfdt =
        container.documentEditor.serialize();

    const response = await fetch(
        hostUrl + 'BenchmarkPdf',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: sfdt
            })
        });

    if (response.status === 200) {

        const blob =
            await response.blob();

        downloadBlob(
            blob,
            'Document.pdf'
        );

        metrics.pdfExport =
            Math.round(
                performance.now() -
                start
            );

        updateMetrics();
    }
}
function toggleButtons(
    enabled: boolean
): void {

    [
        'downloadBtn',
        'rtfBtn',
        'htmlBtn',
        'pdfBtn'
    ].forEach(id => {

        const element =
            document.getElementById(id) as HTMLButtonElement;

        element.disabled = !enabled;
    });
}
(document.getElementById('documentSize') as HTMLSelectElement)
    .addEventListener('change', e => {

        selectedFile =
            (e.target as HTMLSelectElement).value;
    });

    (document.getElementById('loadBtn') as HTMLButtonElement)
    .onclick = loadEditor;

(document.getElementById('destroyBtn') as HTMLButtonElement)
    .onclick = destroyEditor;

(document.getElementById('downloadBtn') as HTMLButtonElement)
    .onclick = downloadDocument;

(document.getElementById('rtfBtn') as HTMLButtonElement)
    .onclick = benchmarkRtf;

(document.getElementById('htmlBtn') as HTMLButtonElement)
    .onclick = benchmarkHtml;

(document.getElementById('pdfBtn') as HTMLButtonElement)
    .onclick = benchmarkPdf;