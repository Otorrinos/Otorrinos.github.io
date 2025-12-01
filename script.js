

function setupSignatureCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = Math.floor(w * ratio);
        canvas.height = Math.floor(h * ratio);
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
    }
    resize();
    window.addEventListener('resize', resize);

    let drawing = false;
    let lastX = 0, lastY = 0;
    let savedScrollY = 1;
        
    /*function pointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);
        return {x, y};
    }*/

        function pointerPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

    function preventScroll(e) {e.preventDefault();}
    function disableTouchGestures(){
        document.addEventListener("touchmove", preventScroll, {passive: false});
    }
    function enableTouchGestures(){
        document.removeEventListener("touchmove", preventScroll);
    }

        // eventos de la firma
    canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        disableTouchGestures(); //bloquea 
        const p = pointerPos(e);
        drawing = true;
        lastX = p.x; lastY = p.y;
    }, {passive:false});
        
    canvas.addEventListener('pointermove', (e) => {
        if (!drawing) return;
        const p = pointerPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        lastX = p.x; lastY = p.y;
    }, {passive:false});
        
    window.addEventListener('pointerup', () => { drawing= false; enableTouchGestures();});
    window.addEventListener('pointercancel', () => {drawing=false;enableTouchGestures();});
    return ctx;
}
    
const canvasFirma1 = document.getElementById('canvasFirma1');
const canvasFirma2 = document.getElementById('canvasFirma2');
const ctx1 = setupSignatureCanvas(canvasFirma1);
const ctx2 = setupSignatureCanvas(canvasFirma2);

function limpiarTodosFirmas(){
    [canvasFirma1, canvasFirma2].forEach(c => c.getContext('2d').clearRect(0, 0, c.width, c.height));
        
        //borrar textos
    const textInputs = document.querySelectorAll('input[type="date"],textarea, input[type="text"]');
    textInputs.forEach(input => {input.value = "";});
        
        //desmarcar checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox=>{checkbox.checked = false;});
}

function canvasToImgEl(c) {
    const img = new Image();
    img.src = c.toDataURL('image/png');
    img.style.width = c.clientWidth + 'px';
    img.style.height = c.clientHeight + 'px';
    return img;
}
    
document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});

function guardarPDF() {
    const contenido = document.getElementById("checklist").cloneNode(true);
    contenido.querySelectorAll('textarea').forEach(ta=>{
        const div = document.createElement('div');
        div.className = 'textarea-print';
        div.textContent = ta.value; // copia texto
        div.style.whiteSpace = 'pre-wrap'; // respeta saltos
        div.style.wordBreak = 'break-word';
        div.style.minHeight = ta.scrollHeight + 'px';
        div.style.fontSize = '10px';
        div.style.border = '1px solid #ccc';
        div.style.padding = '4px';
        div.style.textAlign = 'left';
        ta.parentNode.replaceChild(div, ta);
    });

    const c1 = contenido.querySelector("#canvasFirma1");
    const c2 = contenido.querySelector("#canvasFirma2");
    if (c1 && c2) {
        c1.parentNode.replaceChild(canvasToImgEl(canvasFirma1), c1);
        c2.parentNode.replaceChild(canvasToImgEl(canvasFirma2), c2);
    }

    const img2 = document.createElement("img");
    img2.src = canvasFirma2.toDataURL("image/png");
    img2.style.width = "200px";
    img2.style.height = "80px";
    const opt = {
        margin: [1,1,1,1],
        filename: 'checklist.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(contenido).save();
}