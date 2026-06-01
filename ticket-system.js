/* ══════════════════════════════════════════════════════════════
   ELEMENTAL CLUB — TICKET SYSTEM v4
   PDF: jsPDF DIRECTO — sin html2canvas, 100% vectorial
   Modal preview: oscuro moderno (panel staff)
   Diagnóstico v3: html2canvas fallaba por visibility:hidden + CORS logo
══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ticketActivo = null;
  window._ultimoIngresoDatos = null;

  /* ── CSS ─────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = `
    /* ── Overlay ── */
    .ticket-overlay {
      display:none; position:fixed; inset:0; z-index:1050;
      background:rgba(0,0,0,0.94); backdrop-filter:blur(18px);
      align-items:center; justify-content:center; padding:1rem; overflow-y:auto;
    }
    .ticket-overlay.on { display:flex; animation:tkovIn .28s cubic-bezier(.22,1,.36,1); }
    @keyframes tkovIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }

    /* ── Modal box ── */
    .ticket-modal {
      background:#0e0e0e;
      border:1px solid rgba(255,77,0,.2);
      border-top:2px solid #FF4D00;
      width:100%; max-width:440px;
      border-radius:8px; margin:auto; position:relative;
      box-shadow:0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,77,0,.1);
      animation:tkmUp .32s cubic-bezier(.22,1,.36,1);
    }
    @keyframes tkmUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
    .ticket-modal::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background:linear-gradient(90deg,#FF4D00 0%,rgba(255,77,0,.3) 50%,transparent 100%);
    }

    /* ── Header ── */
    .ticket-modal-hdr {
      display:flex; align-items:center; justify-content:space-between;
      padding:1.1rem 1.5rem; border-bottom:1px solid rgba(255,255,255,.06);
    }
    .ticket-modal-title {
      font-family:'Bebas Neue',sans-serif; font-size:1.35rem; letter-spacing:.06em;
      color:#fff; display:flex; align-items:center; gap:.5rem;
    }
    .ticket-modal-title b { color:#FF4D00; font-weight:400; }
    .ticket-modal-title-icon {
      width:28px; height:28px; background:rgba(255,77,0,.12);
      border:1px solid rgba(255,77,0,.3); border-radius:4px;
      display:flex; align-items:center; justify-content:center;
      font-size:.82rem;
    }
    .ticket-close-x {
      width:32px; height:32px; border-radius:50%;
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; color:rgba(255,255,255,.35); font-size:.85rem;
      transition:all .15s; flex-shrink:0;
    }
    .ticket-close-x:hover { background:rgba(255,77,0,.15); border-color:rgba(255,77,0,.4); color:#FF4D00; }

    /* ── Body ── */
    .ticket-modal-body { padding:1.25rem 1.5rem 1.5rem; }

    /* ── Preview card ── */
    .ticket-preview {
      background:#151515;
      border:1px solid rgba(255,255,255,.07);
      border-left:3px solid #FF4D00;
      border-radius:6px; overflow:hidden; margin-bottom:1.25rem;
    }
    .ticket-preview-head {
      background:linear-gradient(135deg, #FF4D00 0%, #CC3D00 100%);
      padding:1rem 1.2rem;
      display:flex; align-items:center; gap:.75rem;
    }
    .ticket-preview-head-icon {
      width:36px; height:36px; background:rgba(255,255,255,.15); border-radius:6px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .ticket-preview-head-brand { flex:1; min-width:0; }
    .ticket-preview-head-brand h5 {
      font-family:'Bebas Neue',sans-serif; font-size:1.1rem; letter-spacing:.1em;
      color:#fff; line-height:1; margin:0;
    }
    .ticket-preview-head-brand p {
      font-size:.55rem; color:rgba(255,255,255,.7); letter-spacing:.2em;
      text-transform:uppercase; margin:.1rem 0 0;
    }
    .ticket-preview-head-id {
      text-align:right; flex-shrink:0;
    }
    .ticket-preview-head-id .id-lbl {
      font-size:.48rem; font-weight:800; letter-spacing:.2em; text-transform:uppercase;
      color:rgba(255,255,255,.6); display:block;
    }
    .ticket-preview-head-id .id-val {
      font-family:'Bebas Neue',sans-serif; font-size:.95rem; color:#fff; letter-spacing:.04em;
    }

    /* ── Rows ── */
    .ticket-preview-rows { padding:.75rem 1.1rem; }
    .trow {
      display:flex; justify-content:space-between; align-items:baseline;
      padding:.4rem 0; border-bottom:1px solid rgba(255,255,255,.04);
    }
    .trow:last-child { border-bottom:none; }
    .trow-key {
      font-size:.58rem; font-weight:700; letter-spacing:.15em; text-transform:uppercase;
      color:rgba(255,255,255,.3); flex-shrink:0; padding-right:.75rem;
    }
    .trow-val { font-size:.78rem; font-weight:600; color:rgba(255,255,255,.82); text-align:right; }
    .trow-val.accent { color:#FF4D00; font-weight:800; }
    .trow-val.green  { color:#4ade80; font-weight:700; }
    .trow-val.big    { font-family:'Bebas Neue',sans-serif; font-size:1.6rem; color:#FF4D00; line-height:1; }

    /* ── Footer note ── */
    .ticket-preview-foot {
      background:rgba(255,77,0,.06); border-top:1px solid rgba(255,77,0,.15);
      padding:.6rem 1.1rem; text-align:center;
      font-size:.58rem; color:rgba(255,255,255,.25); letter-spacing:.04em; line-height:1.6;
    }

    /* ── Buttons ── */
    .btn-dl-ticket {
      width:100%; padding:.88rem; background:#FF4D00; color:#fff;
      border:none; font-family:'DM Sans','Inter',sans-serif; font-size:.75rem;
      font-weight:800; letter-spacing:.18em; text-transform:uppercase;
      cursor:pointer; border-radius:5px;
      clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
      transition:all .22s; display:flex; align-items:center; justify-content:center; gap:.5rem;
    }
    .btn-dl-ticket:hover { background:#CC3D00; transform:translateY(-2px); box-shadow:0 8px 24px rgba(255,77,0,.4); }
    .btn-dl-ticket:disabled { opacity:.45; cursor:not-allowed; transform:none; box-shadow:none; clip-path:none; }
    .btn-dl-ticket.success { background:#16a34a; clip-path:none; }

    .ticket-cancel-btn {
      width:100%; margin-top:.6rem; padding:.72rem;
      background:transparent; border:1px solid rgba(255,255,255,.08);
      color:rgba(255,255,255,.35); font-family:'DM Sans','Inter',sans-serif;
      font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
      cursor:pointer; border-radius:5px; transition:all .18s;
    }
    .ticket-cancel-btn:hover { border-color:rgba(255,255,255,.15); color:rgba(255,255,255,.6); }

    .ticket-pdf-hint {
      text-align:center; font-size:.62rem; color:rgba(255,255,255,.18);
      margin-top:.6rem; line-height:1.5;
    }

    /* Pequeño botón en tabla */
    .btn-mov-ticket {
      background:transparent; border:1px solid rgba(255,77,0,.4); color:#FF4D00;
      padding:.25rem .65rem; font-size:.58rem; font-weight:800; letter-spacing:.1em;
      text-transform:uppercase; cursor:pointer; border-radius:3px; transition:all .18s;
      white-space:nowrap; font-family:'DM Sans','Inter',sans-serif; margin-left:.3rem;
    }
    .btn-mov-ticket:hover { background:rgba(255,77,0,.12); border-color:#FF4D00; }
    .btn-ticket-sm {
      background:transparent; border:1px solid rgba(255,77,0,.4); color:#FF4D00;
      padding:.25rem .65rem; font-size:.58rem; font-weight:800; letter-spacing:.1em;
      text-transform:uppercase; cursor:pointer; border-radius:3px; transition:all .18s;
      white-space:nowrap; font-family:'DM Sans','Inter',sans-serif;
    }
    .btn-ticket-sm:hover { background:rgba(255,77,0,.12); border-color:#FF4D00; }
  `;
  document.head.appendChild(style);

  /* ── HTML del modal ─────────────────────────────────────── */
  var wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="ticket-overlay" id="ticket-overlay">
      <div class="ticket-modal">
        <div class="ticket-modal-hdr">
          <div class="ticket-modal-title">
            <div class="ticket-modal-title-icon">🧾</div>
            TICKET DE <b>PAGO</b>
          </div>
          <div class="ticket-close-x" id="ticket-close-btn">✕</div>
        </div>
        <div class="ticket-modal-body">
          <div class="ticket-preview" id="ticket-preview-content"></div>
          <button class="btn-dl-ticket" id="btn-dl-ticket">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Descargar Ticket PDF
          </button>
          <div class="ticket-pdf-hint">PDF profesional · fondo blanco · vectorial</div>
          <button class="ticket-cancel-btn" id="ticket-cancel-btn">Cerrar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  document.getElementById('ticket-overlay').addEventListener('click', function (e) { if (e.target === this) cerrarTicket(); });
  document.getElementById('ticket-close-btn').addEventListener('click', cerrarTicket);
  document.getElementById('ticket-cancel-btn').addEventListener('click', cerrarTicket);
  document.getElementById('btn-dl-ticket').addEventListener('click', descargarTicketPDF);

  /* ── Helpers ─────────────────────────────────────────────── */
  window.generarOperationId = function (fecha) {
    var d = fecha ? fecha.replace(/-/g, '') : new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Mexico_City' }).replace(/-/g, '');
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var rand = '';
    for (var i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    return 'EC-' + d + '-' + rand + Date.now().toString(36).slice(-3).toUpperCase();
  };

  function fmtMXN(n) {
    return '$' + parseFloat(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fechaLarga(iso) {
    if (!iso) return '—';
    return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  function mkTrow(key, val, cls) {
    return '<div class="trow"><span class="trow-key">' + key + '</span><span class="trow-val' + (cls ? ' ' + cls : '') + '">' + val + '</span></div>';
  }

  /* ── Abrir modal preview ─────────────────────────────────── */
  window.abrirTicket = function (datos) {
    ticketActivo = datos;
    var f = fechaLarga(datos.fecha);

    var html =
      '<div class="ticket-preview-head">' +
        '<div class="ticket-preview-head-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>' +
        '<div class="ticket-preview-head-brand"><h5>ELEMENTAL CLUB</h5><p>Comprobante de pago</p></div>' +
        '<div class="ticket-preview-head-id"><span class="id-lbl">ID Operación</span><span class="id-val">' + (datos.operationId || '—') + '</span></div>' +
      '</div>' +
      '<div class="ticket-preview-rows">' +
        mkTrow('Cliente', datos.nombre || '—') +
        mkTrow('Membresía', datos.plan || datos.categoria || '—') +
        mkTrow('Fecha', f) +
        (datos.meses ? mkTrow('Duración', datos.meses + (parseInt(datos.meses) === 1 ? ' mes' : ' meses')) : '') +
        (datos.expiracion ? mkTrow('Vence', datos.expiracion, 'green') : '') +
        mkTrow('Monto', fmtMXN(datos.monto), 'big') +
        (datos.cartera ? mkTrow('Cartera', datos.cartera) : '') +
        (datos.empleado ? mkTrow('Atendido por', datos.empleado) : '') +
      '</div>' +
      '<div class="ticket-preview-foot">Elemental Club · León, Gto. · 477 924 8796</div>';

    document.getElementById('ticket-preview-content').innerHTML = html;
    var btn = document.getElementById('btn-dl-ticket');
    btn.disabled = false;
    btn.classList.remove('success');
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Descargar Ticket PDF';
    document.getElementById('ticket-overlay').classList.add('on');
    document.body.style.overflow = 'hidden';
  };

  function cerrarTicket() {
    document.getElementById('ticket-overlay').classList.remove('on');
    document.body.style.overflow = '';
  }
  window.cerrarTicket = cerrarTicket;

  /* ════════════════════════════════════════════════════════════
     PDF — jsPDF DIRECTO (sin html2canvas)
     Genera texto, formas y líneas vectoriales nativamente.
     Mucho más confiable que html2canvas en entornos con CORS/CSP.
  ════════════════════════════════════════════════════════════ */

  function loadJsPDF() {
    return new Promise(function (resolve, reject) {
      if (window.jspdf && window.jspdf.jsPDF) { resolve(window.jspdf.jsPDF); return; }
      if (window.jsPDF) { resolve(window.jsPDF); return; }
      var sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      sc.onload = function () {
        var J = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (J) resolve(J);
        else reject(new Error('jsPDF no disponible tras carga'));
      };
      sc.onerror = function () { reject(new Error('No se pudo cargar jsPDF')); };
      document.head.appendChild(sc);
    });
  }

  /* Utilidad: texto centrado */
  function centeredText(doc, text, y, maxWidth) {
    var w = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
    var x = (maxWidth - w) / 2;
    doc.text(text, x, y);
  }

  /* Utilidad: rectángulo redondeado (jsPDF no tiene nativo en todas versiones) */
  function roundRect(doc, x, y, w, h, r) {
    if (doc.roundedRect) {
      doc.roundedRect(x, y, w, h, r, r);
    } else {
      doc.rect(x, y, w, h);
    }
  }

  function descargarTicketPDF() {
    if (!ticketActivo) return;
    var d = ticketActivo;
    var btn = document.getElementById('btn-dl-ticket');
    btn.disabled = true;
    btn.innerHTML = '⏳ Generando PDF…';

    loadJsPDF().then(function (jsPDF) {
      /* ── Dimensiones en mm (ancho tarjeta térmica: 80mm) ── */
      var W = 80;
      var margin = 6;
      var innerW = W - margin * 2;
      var y = 0;

      var doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [W, 200], /* altura provisional; se ajusta al final */
      });

      /* ── Colores ── */
      var OR = [255, 77, 0];
      var OR2 = [204, 61, 0];
      var BG = [255, 255, 255];
      var DARK = [15, 15, 15];
      var GRAY = [100, 100, 100];
      var LGRAY = [220, 220, 220];
      var GREEN_R = [22, 163, 74];
      var HEADER_BG = [15, 15, 15]; /* negro elegante */

      /* ── Fuentes ── */
      /* Solo las estándar están disponibles sin embed */
      /* Usaremos Helvetica (similar a Inter/DM Sans) */

      /* ── 1. BANDA HEADER NARANJA ── */
      doc.setFillColor(OR[0], OR[1], OR[2]);
      doc.rect(0, 0, W, 20, 'F');

      /* Degradado simulado con segunda banda más oscura */
      doc.setFillColor(OR2[0], OR2[1], OR2[2]);
      doc.rect(0, 14, W, 6, 'F');

      /* NOMBRE DEL GYM */
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      centeredText(doc, 'ELEMENTAL CLUB', 10, W);

      /* Subtítulo */
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(255, 220, 200);
      centeredText(doc, 'COMPROBANTE DE PAGO OFICIAL', 16, W);

      y = 24;

      /* ── 2. BANDA OSCURA — ID OPERACIÓN ── */
      doc.setFillColor(HEADER_BG[0], HEADER_BG[1], HEADER_BG[2]);
      doc.rect(0, y - 2, W, 10, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(150, 150, 150);
      doc.text('ID OPERACIÓN', margin, y + 3);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(OR[0], OR[1], OR[2]);
      var idText = (d.operationId || '—');
      var idW = doc.getStringUnitWidth(idText) * 8 / doc.internal.scaleFactor;
      doc.text(idText, W - margin - idW, y + 3.5);

      y += 11;

      /* ── 3. BLOQUE CLIENTE ── */
      /* Fondo sutil */
      doc.setFillColor(250, 250, 250);
      doc.rect(0, y, W, 14, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.text('CLIENTE', margin, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      /* Truncar nombre si es muy largo */
      var nombre = (d.nombre || 'Sin nombre').toUpperCase();
      doc.text(nombre, margin, y + 11, { maxWidth: innerW });

      y += 16;

      /* ── 4. SEPARADOR ── */
      doc.setDrawColor(LGRAY[0], LGRAY[1], LGRAY[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, y, W - margin, y);
      y += 4;

      /* ── 5. FUNCIÓN ROW ── */
      function row(label, value, valueColor, bold) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text(label.toUpperCase(), margin, y);

        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(8);
        if (valueColor) doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
        else doc.setTextColor(DARK[0], DARK[1], DARK[2]);

        var valW = doc.getStringUnitWidth(value) * 8 / doc.internal.scaleFactor;
        var xVal = W - margin - valW;
        if (xVal < margin + 20) xVal = margin + 20; /* evitar overflow */
        doc.text(value, xVal, y, { maxWidth: innerW - 22 });

        y += 6;

        /* Línea divisoria ligera */
        doc.setDrawColor(235, 235, 235);
        doc.setLineWidth(0.2);
        doc.line(margin, y - 1.5, W - margin, y - 1.5);
      }

      /* ── 6. DATOS ── */
      var fechaStr = d.fecha ? new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric'
      }) : '—';

      row('Membresía / Plan', d.plan || d.categoria || '—');
      row('Fecha de pago', fechaStr);
      if (d.meses) row('Duración', d.meses + (parseInt(d.meses) === 1 ? ' mes' : ' meses'));
      if (d.expiracion) row('Vigencia hasta', d.expiracion, GREEN_R, true);
      if (d.cartera) row('Forma de pago', d.cartera);
      if (d.empleado) row('Atendido por', d.empleado);

      y += 2;

      /* ── 7. MONTO — BLOQUE DESTACADO ── */
      doc.setFillColor(255, 247, 243);
      doc.rect(margin, y, innerW, 18, 'F');
      doc.setDrawColor(OR[0], OR[1], OR[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin, y + 18); /* borde izquierdo naranja */

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(OR[0], OR[1], OR[2]);
      doc.text('MONTO TOTAL PAGADO', margin + 3, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(OR[0], OR[1], OR[2]);
      var montoStr = fmtMXN(d.monto);
      doc.text(montoStr, margin + 3, y + 14);

      y += 22;

      /* ── 8. LÍNEA PUNTEADA ── */
      doc.setDrawColor(LGRAY[0], LGRAY[1], LGRAY[2]);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([1, 1.5], 0);
      doc.line(margin, y, W - margin, y);
      doc.setLineDashPattern([], 0);
      y += 5;

      /* ── 9. FOOTER ── */
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      var footLines = [
        'Este comprobante es válido como recibo oficial.',
        'Elemental Club · León, Gto.',
        'Tel: 477 924 8796 · recepcionelemental@hotmail.com',
        'P. Magisterial 1519, Punta del Este',
      ];
      footLines.forEach(function (line) {
        centeredText(doc, line, y, W);
        y += 4;
      });
      y += 2;

      /* ── 10. BANDA NARANJA FINAL ── */
      doc.setFillColor(OR[0], OR[1], OR[2]);
      doc.rect(0, y, W, 4, 'F');
      y += 6;

      /* Ajustar altura final del documento */
      var finalHeight = y + 2;
      var doc2 = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [W, finalHeight],
      });

      /* Re-dibujar en doc2 con dimensiones exactas */
      /* ── Redibujar — llamar al generador con doc2 ── */
      function drawTicket(doc) {
        var W = 80, margin = 6, innerW = W - margin * 2;
        var y = 0;

        doc.setFillColor(OR[0], OR[1], OR[2]);
        doc.rect(0, 0, W, 20, 'F');
        doc.setFillColor(OR2[0], OR2[1], OR2[2]);
        doc.rect(0, 14, W, 6, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        centeredText(doc, 'ELEMENTAL CLUB', 10, W);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(255, 220, 200);
        centeredText(doc, 'COMPROBANTE DE PAGO OFICIAL', 16, W);

        y = 24;

        doc.setFillColor(HEADER_BG[0], HEADER_BG[1], HEADER_BG[2]);
        doc.rect(0, y - 2, W, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(150, 150, 150);
        doc.text('ID OPERACION', margin, y + 3);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(OR[0], OR[1], OR[2]);
        var idText = (d.operationId || '—');
        var idW2 = doc.getStringUnitWidth(idText) * 8 / doc.internal.scaleFactor;
        doc.text(idText, W - margin - idW2, y + 3.5);

        y += 11;

        doc.setFillColor(250, 250, 250);
        doc.rect(0, y, W, 14, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text('CLIENTE', margin, y + 5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(DARK[0], DARK[1], DARK[2]);
        doc.text((d.nombre || 'Sin nombre').toUpperCase(), margin, y + 11, { maxWidth: innerW });

        y += 16;

        doc.setDrawColor(LGRAY[0], LGRAY[1], LGRAY[2]);
        doc.setLineWidth(0.3);
        doc.line(margin, y, W - margin, y);
        y += 4;

        function row2(label, value, valueColor, bold) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
          doc.text(label.toUpperCase(), margin, y);
          doc.setFont('helvetica', bold ? 'bold' : 'normal');
          doc.setFontSize(8);
          if (valueColor) doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
          else doc.setTextColor(DARK[0], DARK[1], DARK[2]);
          var vW = doc.getStringUnitWidth(value) * 8 / doc.internal.scaleFactor;
          var xV = W - margin - vW;
          if (xV < margin + 20) xV = margin + 20;
          doc.text(value, xV, y, { maxWidth: innerW - 22 });
          y += 6;
          doc.setDrawColor(235, 235, 235);
          doc.setLineWidth(0.2);
          doc.line(margin, y - 1.5, W - margin, y - 1.5);
        }

        var fechaStr2 = d.fecha ? new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
        row2('Membresia / Plan', d.plan || d.categoria || '—');
        row2('Fecha de pago', fechaStr2);
        if (d.meses) row2('Duracion', d.meses + (parseInt(d.meses) === 1 ? ' mes' : ' meses'));
        if (d.expiracion) row2('Vigencia hasta', d.expiracion, GREEN_R, true);
        if (d.cartera) row2('Forma de pago', d.cartera);
        if (d.empleado) row2('Atendido por', d.empleado);

        y += 2;

        doc.setFillColor(255, 247, 243);
        doc.rect(margin, y, innerW, 18, 'F');
        doc.setDrawColor(OR[0], OR[1], OR[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin, y + 18);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(OR[0], OR[1], OR[2]);
        doc.text('MONTO TOTAL PAGADO', margin + 3, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(OR[0], OR[1], OR[2]);
        doc.text(fmtMXN(d.monto), margin + 3, y + 14);

        y += 22;

        doc.setDrawColor(LGRAY[0], LGRAY[1], LGRAY[2]);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([1, 1.5], 0);
        doc.line(margin, y, W - margin, y);
        doc.setLineDashPattern([], 0);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        ['Este comprobante es valido como recibo oficial.',
         'Elemental Club - Leon, Gto.',
         'Tel: 477 924 8796',
         'recepcionelemental@hotmail.com',
         'P. Magisterial 1519, Punta del Este'].forEach(function (l) {
          centeredText(doc, l, y, W); y += 4;
        });
        y += 2;

        doc.setFillColor(OR[0], OR[1], OR[2]);
        doc.rect(0, y, W, 4, 'F');
        y += 4;

        return y;
      }

      var finalH = drawTicket(doc2) + 4;
      /* Nota: jsPDF no permite cambiar el format post-creación en todas versiones,
         pero al crear con la altura calculada (y el doc2 ya tiene la altura correcta si
         se calcula antes). Como truco, usamos el primer doc para medir y doc2 para guardar */

      /* En su lugar: hacemos todo en un solo doc con altura precalculada */
      var measuredH = finalH;
      var finalDoc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [W, Math.max(measuredH, 120)],
      });
      drawTicket(finalDoc);

      var fileName = 'Ticket_EC_' + (d.operationId || 'SIN-ID').replace(/[^A-Z0-9\-]/gi, '_') + '.pdf';
      finalDoc.save(fileName);

      btn.disabled = false;
      btn.classList.add('success');
      btn.innerHTML = '✓ PDF descargado';
      setTimeout(function () {
        btn.classList.remove('success');
        btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Descargar Ticket PDF';
      }, 3000);

    }).catch(function (e) {
      btn.disabled = false;
      btn.innerHTML = 'Error — reintentar';
      alert('Error al generar PDF: ' + e.message);
    });
  }
  window.descargarTicketPDF = descargarTicketPDF;

  /* ── Ticket desde tabla de movimientos ─────────────────── */
  window.abrirTicketMov = function (id, tipo) {
    var movData = window.movData || [];
    var mov = movData.find(function (r) { return String(r.id) === String(id) && r.tipo === tipo; });
    if (mov) {
      window.abrirTicket({
        nombre: mov.concepto, plan: mov.categoria, categoria: mov.categoria,
        monto: mov.monto, fecha: mov.fecha, cartera: mov.cartera,
        meses: null, expiracion: null,
        operationId: mov.operation_id || window.generarOperationId(mov.fecha),
        empleado: mov.empleado,
      });
      return;
    }
    if (!window.supabase) { alert('Sin conexión.'); return; }
    window.supabase.from('ingresos')
      .select('id,nombre,monto,fecha,categoria,cartera,usuario,operation_id,descripcion')
      .eq('id', id).single()
      .then(function (r) {
        if (r.error || !r.data) { alert('Movimiento no encontrado.'); return; }
        var row = r.data;
        window.abrirTicket({
          nombre: row.nombre, plan: row.descripcion || row.categoria, categoria: row.categoria,
          monto: row.monto, fecha: row.fecha, cartera: row.cartera,
          meses: null, expiracion: null,
          operationId: row.operation_id || window.generarOperationId(row.fecha),
          empleado: row.usuario,
        });
      })
      .catch(function (e) { alert('Error: ' + e.message); });
  };

  console.log('✅ Elemental Club — Ticket System v4 (jsPDF directo)');
})();