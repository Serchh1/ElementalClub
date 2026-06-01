/* ══════════════════════════════════════════════════════════════
   ELEMENTAL CLUB — TICKET SYSTEM
   Incluir con: <script src="ticket-system.js"></script>
   Justo antes del cierre </body> en staff.html
   Requiere: html2pdf.js (ya incluido en staff.html)
══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── Estado ─────────────────────────────────────────────── */
  var ticketActivo = null;
  window._ultimoIngresoDatos = null;

  /* ── CSS del sistema de tickets ─────────────────────────── */
  var ticketCSS = `
    .ticket-overlay {
      display: none; position: fixed; inset: 0; z-index: 1050;
      background: rgba(0,0,0,0.92); backdrop-filter: blur(14px);
      align-items: center; justify-content: center; padding: 1rem;
      overflow-y: auto;
    }
    .ticket-overlay.on { display: flex; animation: ticketFadeIn .25s ease; }
    @keyframes ticketFadeIn { from{opacity:0} to{opacity:1} }
    .ticket-modal {
      background: var(--s1,#0f0f0f); border: 1px solid var(--s3,#202020);
      border-top: 2px solid var(--or,#FF4D00); width: 100%; max-width: 480px;
      border-radius: 5px; margin: auto; position: relative;
      animation: ticketMUp .3s cubic-bezier(.22,1,.36,1);
    }
    @keyframes ticketMUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    .ticket-modal::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, var(--or,#FF4D00), transparent 60%);
    }
    .ticket-modal-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 1.4rem; border-bottom: 1px solid var(--s3,#202020);
    }
    .ticket-modal-title {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; letter-spacing: .04em;
    }
    .ticket-modal-title b { color: var(--or,#FF4D00); font-weight: 400; }
    .ticket-modal-body { padding: 1.4rem; }
    .ticket-preview {
      background: var(--s2,#161616); border: 1px solid var(--s3,#202020);
      border-radius: 5px; padding: 1.2rem; margin-bottom: 1.2rem;
    }
    .ticket-preview-header {
      display: flex; align-items: center; gap: .75rem; margin-bottom: 1rem;
      padding-bottom: .85rem; border-bottom: 1px solid rgba(255,77,0,.2);
    }
    .ticket-preview-logo { width: 38px; height: 38px; object-fit: contain; flex-shrink: 0; }
    .ticket-preview-brand h4 {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.15rem;
      letter-spacing: .08em; line-height: 1;
    }
    .ticket-preview-brand h4 b { color: var(--or,#FF4D00); font-weight: 400; }
    .ticket-preview-brand p {
      font-size: .55rem; color: rgba(255,255,255,.3);
      letter-spacing: .15em; text-transform: uppercase; margin-top: .1rem;
    }
    .ticket-op-id {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,77,0,.07); border: 1px solid rgba(255,77,0,.2);
      padding: .45rem .7rem; border-radius: 3px; margin-bottom: .85rem;
    }
    .ticket-op-id-lbl {
      font-size: .55rem; font-weight: 800; letter-spacing: .18em;
      text-transform: uppercase; color: rgba(255,255,255,.3);
    }
    .ticket-op-id-val {
      font-family: 'Bebas Neue', sans-serif; font-size: 1rem;
      color: var(--or,#FF4D00); letter-spacing: .04em;
    }
    .ticket-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: .38rem 0; border-bottom: 1px solid rgba(255,255,255,.04);
    }
    .ticket-row:last-child { border-bottom: none; }
    .ticket-row-key {
      font-size: .6rem; font-weight: 700; letter-spacing: .12em;
      text-transform: uppercase; color: rgba(255,255,255,.3); padding-top: .05rem; flex-shrink: 0;
    }
    .ticket-row-val {
      font-size: .78rem; font-weight: 600; color: rgba(255,255,255,.82);
      text-align: right; max-width: 65%;
    }
    .ticket-monto-val {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
      color: var(--or,#FF4D00);
    }
    .ticket-footer-note {
      font-size: .62rem; color: rgba(255,255,255,.2); text-align: center;
      margin-top: .85rem; padding-top: .65rem;
      border-top: 1px dashed rgba(255,255,255,.08); line-height: 1.5;
    }
    .btn-dl-ticket {
      width: 100%; padding: .85rem; background: var(--or,#FF4D00); color: #fff;
      border: none; font-family: 'DM Sans', sans-serif; font-size: .75rem;
      font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
      cursor: pointer; border-radius: 5px;
      clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
      transition: all .22s; display: flex; align-items: center;
      justify-content: center; gap: .5rem;
    }
    .btn-dl-ticket:hover {
      background: var(--or2,#CC3D00); transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255,77,0,.35);
    }
    .btn-dl-ticket:disabled {
      opacity: .45; cursor: not-allowed; transform: none;
      box-shadow: none; clip-path: none;
    }
    .btn-ticket-sm {
      background: transparent; border: 1px solid rgba(255,77,0,.4);
      color: var(--or,#FF4D00); padding: .25rem .65rem; font-size: .58rem;
      font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      cursor: pointer; border-radius: 3px; transition: all .18s;
      white-space: nowrap; font-family: 'DM Sans', sans-serif;
    }
    .btn-ticket-sm:hover { background: rgba(255,77,0,.12); border-color: #FF4D00; }
    #ticket-pdf-template {
      position: fixed; top: -9999px; left: -9999px; z-index: -1;
      width: 420px; background: #080808; pointer-events: none; opacity: 0;
    }
    .ticket-btn-cancel-custom {
      width: 100%; margin-top: .5rem; padding: .72rem 1.3rem;
      background: transparent; border: 1px solid var(--s3,#202020);
      color: rgba(238,238,238,.38); font-family: 'DM Sans', sans-serif;
      font-size: .72rem; font-weight: 700; letter-spacing: .12em;
      text-transform: uppercase; cursor: pointer; border-radius: 5px;
      transition: all .18s;
    }
    .ticket-btn-cancel-custom:hover {
      border-color: var(--s4,#2d2d2d); color: var(--txt,#eee);
    }
  `;

  /* ── Inyectar CSS ────────────────────────────────────────── */
  var styleEl = document.createElement('style');
  styleEl.textContent = ticketCSS;
  document.head.appendChild(styleEl);

  /* ── Inyectar HTML del modal + template PDF ──────────────── */
  var modalHtml = `
    <div class="ticket-overlay" id="ticket-overlay">
      <div class="ticket-modal">
        <div class="ticket-modal-hdr">
          <div class="ticket-modal-title">TICKET DE <b>OPERACIÓN</b></div>
          <div class="mx" id="ticket-close-btn" style="cursor:pointer;width:33px;height:33px;border-radius:50%;background:var(--s2,#161616);border:1px solid var(--s3,#202020);display:flex;align-items:center;justify-content:center;color:rgba(238,238,238,.38);font-size:.9rem;transition:all .15s;flex-shrink:0;">✕</div>
        </div>
        <div class="ticket-modal-body">
          <div class="ticket-preview" id="ticket-preview-content"></div>
          <button class="btn-dl-ticket" id="btn-dl-ticket">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Descargar Ticket PDF
          </button>
          <button class="ticket-btn-cancel-custom" id="ticket-cancel-btn">Cerrar</button>
        </div>
      </div>
    </div>
    <div id="ticket-pdf-template"></div>
  `;

  var wrapper = document.createElement('div');
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper);

  /* ── Event listeners del modal ───────────────────────────── */
  document.getElementById('ticket-overlay').addEventListener('click', function(e) {
    if (e.target === this) cerrarTicket();
  });
  document.getElementById('ticket-close-btn').addEventListener('click', cerrarTicket);
  document.getElementById('ticket-cancel-btn').addEventListener('click', cerrarTicket);
  document.getElementById('btn-dl-ticket').addEventListener('click', descargarTicketPDF);

  /* ── Generar ID de operación ─────────────────────────────── */
  window.generarOperationId = function(fecha) {
    var d = fecha
      ? fecha.replace(/-/g, '')
      : new Date().toLocaleDateString('sv-SE', {timeZone: 'America/Mexico_City'}).replace(/-/g, '');
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var rand = '';
    for (var i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    var ts = Date.now().toString(36).slice(-3).toUpperCase();
    return 'EC-' + d + '-' + rand + ts;
  };

  /* ── Abrir modal ticket ──────────────────────────────────── */
  window.abrirTicket = function(datos) {
    ticketActivo = datos;
    var logoPath = 'img/LOGO SIMPLE FONDO NEGRO.jpeg';

    var fechaFmt = datos.fecha
      ? new Date(datos.fecha + 'T12:00:00').toLocaleDateString('es-MX', {
          weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
        })
      : '—';

    var expLine = datos.expiracion
      ? '<div class="ticket-row"><span class="ticket-row-key">Vence</span><span class="ticket-row-val" style="color:#4ade80;">' + datos.expiracion + '</span></div>'
      : '';
    var durLine = datos.meses
      ? '<div class="ticket-row"><span class="ticket-row-key">Duración</span><span class="ticket-row-val">' + datos.meses + (parseInt(datos.meses) === 1 ? ' mes' : ' meses') + '</span></div>'
      : '';
    var carteraLine = datos.cartera
      ? '<div class="ticket-row"><span class="ticket-row-key">Cartera</span><span class="ticket-row-val">' + datos.cartera + '</span></div>'
      : '';
    var empleadoLine = datos.empleado
      ? '<div class="ticket-row"><span class="ticket-row-key">Atendido por</span><span class="ticket-row-val">' + datos.empleado + '</span></div>'
      : '';

    var html =
      '<div class="ticket-preview-header">' +
        '<img src="' + logoPath + '" class="ticket-preview-logo" onerror="this.style.display=\'none\'" alt="Logo EC" />' +
        '<div class="ticket-preview-brand">' +
          '<h4>ELEMENTAL <b>CLUB</b></h4>' +
          '<p>Comprobante de pago</p>' +
        '</div>' +
      '</div>' +
      '<div class="ticket-op-id">' +
        '<span class="ticket-op-id-lbl">ID Operación</span>' +
        '<span class="ticket-op-id-val">' + (datos.operationId || '—') + '</span>' +
      '</div>' +
      '<div class="ticket-row"><span class="ticket-row-key">Cliente</span><span class="ticket-row-val">' + (datos.nombre || '—') + '</span></div>' +
      '<div class="ticket-row"><span class="ticket-row-key">Membresía</span><span class="ticket-row-val">' + (datos.plan || datos.categoria || '—') + '</span></div>' +
      '<div class="ticket-row"><span class="ticket-row-key">Fecha pago</span><span class="ticket-row-val" style="font-size:.72rem;">' + fechaFmt + '</span></div>' +
      durLine + expLine +
      '<div class="ticket-row"><span class="ticket-row-key">Monto</span><span class="ticket-row-val ticket-monto-val">$' + parseFloat(datos.monto || 0).toLocaleString('es-MX', {minimumFractionDigits: 2}) + '</span></div>' +
      carteraLine + empleadoLine +
      '<div class="ticket-footer-note">Comprobante válido como recibo de pago.<br>Elemental Club · León, Gto. · 477 924 8796</div>';

    document.getElementById('ticket-preview-content').innerHTML = html;
    document.getElementById('ticket-overlay').classList.add('on');
    document.body.style.overflow = 'hidden';
  };

  /* ── Cerrar modal ────────────────────────────────────────── */
  function cerrarTicket() {
    document.getElementById('ticket-overlay').classList.remove('on');
    document.body.style.overflow = '';
  }
  window.cerrarTicket = cerrarTicket;

  /* ── Descargar PDF ───────────────────────────────────────── */
  function descargarTicketPDF() {
    if (!ticketActivo) return;
    if (typeof html2pdf === 'undefined') {
      alert('La librería PDF aún está cargando. Espera un segundo e intenta de nuevo.');
      return;
    }

    var btn = document.getElementById('btn-dl-ticket');
    btn.disabled = true;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>&nbsp;Generando PDF…';

    var d = ticketActivo;
    var logoPath = 'img/LOGO SIMPLE FONDO NEGRO.jpeg';
    var fechaFmt = d.fecha
      ? new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-MX', {
          weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
        })
      : '—';

    /* Construir filas de la tabla */
    var rows = '';
    var tdKey = 'style="color:rgba(255,255,255,.4);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);"';
    var tdVal = 'style="text-align:right;font-size:13px;color:rgba(255,255,255,.82);padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);"';
    var tdValW = 'style="text-align:right;font-size:13px;font-weight:700;color:#fff;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);"';

    rows += '<tr><td ' + tdKey + '>CLIENTE</td><td ' + tdValW + '>' + (d.nombre || '—') + '</td></tr>';
    rows += '<tr><td ' + tdKey + '>MEMBRESÍA</td><td ' + tdVal + '>' + (d.plan || d.categoria || '—') + '</td></tr>';
    rows += '<tr><td ' + tdKey + '>FECHA DE PAGO</td><td style="text-align:right;font-size:12px;color:rgba(255,255,255,.65);padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);">' + fechaFmt + '</td></tr>';

    if (d.meses) {
      rows += '<tr><td ' + tdKey + '>DURACIÓN</td><td ' + tdVal + '>' + d.meses + (parseInt(d.meses) === 1 ? ' mes' : ' meses') + '</td></tr>';
    }
    if (d.expiracion) {
      rows += '<tr><td ' + tdKey + '>VIGENCIA</td><td style="text-align:right;font-size:13px;color:#4ade80;font-weight:700;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);">' + d.expiracion + '</td></tr>';
    }

    /* Fila de monto destacada */
    rows += '<tr style="background:rgba(255,77,0,.07);">' +
      '<td style="color:rgba(255,255,255,.4);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:12px 0 12px 8px;border-top:1px solid rgba(255,77,0,.25);border-bottom:1px solid rgba(255,77,0,.15);">MONTO PAGADO</td>' +
      '<td style="text-align:right;font-family:\'Bebas Neue\',Arial,sans-serif;font-size:30px;color:#FF4D00;padding:12px 8px 12px 0;border-top:1px solid rgba(255,77,0,.25);border-bottom:1px solid rgba(255,77,0,.15);">$' + parseFloat(d.monto || 0).toLocaleString('es-MX', {minimumFractionDigits: 2}) + '</td>' +
    '</tr>';

    if (d.cartera) {
      rows += '<tr><td ' + tdKey + '>CARTERA</td><td ' + tdVal + '>' + d.cartera + '</td></tr>';
    }
    if (d.empleado) {
      rows += '<tr><td style="color:rgba(255,255,255,.4);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:8px 0;">ATENDIDO POR</td><td style="text-align:right;font-size:13px;color:rgba(255,255,255,.82);padding:8px 0;">' + d.empleado + '</td></tr>';
    }

    var pdfHtml =
      '<div style="width:400px;background:#080808;font-family:\'Inter\',Arial,sans-serif;color:#fff;padding:34px 28px;box-sizing:border-box;">' +

        /* Header con logo */
        '<div style="display:flex;align-items:center;gap:13px;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid rgba(255,77,0,.22);">' +
          '<img src="' + logoPath + '" style="width:48px;height:48px;object-fit:contain;" />' +
          '<div>' +
            '<div style="font-family:\'Bebas Neue\',Arial,sans-serif;font-size:26px;letter-spacing:3px;line-height:1;">ELEMENTAL <span style="color:#FF4D00;">CLUB</span></div>' +
            '<div style="font-size:9px;color:rgba(255,255,255,.3);letter-spacing:2px;text-transform:uppercase;margin-top:3px;">Comprobante de Pago Oficial</div>' +
          '</div>' +
        '</div>' +

        /* ID de operación */
        '<div style="background:rgba(255,77,0,.1);border:1px solid rgba(255,77,0,.28);padding:10px 14px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">' +
          '<span style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.35);">ID OPERACIÓN</span>' +
          '<span style="font-family:\'Bebas Neue\',Arial,sans-serif;font-size:18px;letter-spacing:2px;color:#FF4D00;">' + (d.operationId || '—') + '</span>' +
        '</div>' +

        /* Tabla de datos */
        '<table style="width:100%;border-collapse:collapse;">' + rows + '</table>' +

        /* Footer */
        '<div style="margin-top:24px;padding-top:16px;border-top:1px dashed rgba(255,255,255,.1);text-align:center;">' +
          '<div style="font-size:9px;color:rgba(255,255,255,.25);line-height:1.75;letter-spacing:.5px;">' +
            'Este comprobante es válido como recibo de pago oficial.<br>' +
            'Elemental Club · P.º Magisterial 1519, León, Gto.<br>' +
            '477 924 8796 · recepcionelemental@hotmail.com' +
          '</div>' +
          '<div style="margin-top:12px;font-family:\'Bebas Neue\',Arial,sans-serif;font-size:12px;letter-spacing:3px;color:rgba(255,77,0,.28);">ELEMENTAL CLUB</div>' +
        '</div>' +

      '</div>';

    var tmpl = document.getElementById('ticket-pdf-template');
    tmpl.innerHTML = pdfHtml;

    var fileName = 'Ticket_EC_' + (d.operationId || 'SIN_ID').replace(/[^A-Z0-9\-]/gi, '_') + '.pdf';

    html2pdf().set({
      margin: 0,
      filename: fileName,
      image: {type: 'jpeg', quality: 0.98},
      html2canvas: {scale: 3, backgroundColor: '#080808', logging: false, useCORS: true},
      jsPDF: {unit: 'px', format: [456, 620], orientation: 'portrait', hotfixes: ['px_scaling']}
    }).from(tmpl).save().then(function() {
      tmpl.innerHTML = '';
      btn.disabled = false;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>&nbsp;Descargar Ticket PDF';
    }).catch(function(e) {
      tmpl.innerHTML = '';
      btn.disabled = false;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>&nbsp;Descargar Ticket PDF';
      alert('Error al generar el PDF: ' + e.message);
    });
  }

  /* ── Ticket desde tabla de movimientos ──────────────────── */
  window.abrirTicketMov = function(id, tipo) {
    /* Primero buscar en caché local de movData */
    var movData = window.movData || [];
    var mov = movData.find(function(r) {
      return String(r.id) === String(id) && r.tipo === tipo;
    });

    if (mov) {
      window.abrirTicket({
        nombre: mov.concepto,
        plan: mov.categoria,
        categoria: mov.categoria,
        monto: mov.monto,
        fecha: mov.fecha,
        cartera: mov.cartera,
        meses: null,
        expiracion: null,
        operationId: mov.operation_id || '—',
        empleado: mov.empleado
      });
      return;
    }

    /* Si no está en caché, buscar en Supabase */
    if (!window.supabase) { alert('No hay conexión con la base de datos.'); return; }

    window.supabase.from('ingresos')
      .select('id,nombre,monto,fecha,categoria,cartera,usuario,operation_id,descripcion')
      .eq('id', id)
      .single()
      .then(function(r) {
        if (r.error || !r.data) { alert('No se encontró el movimiento.'); return; }
        var row = r.data;
        window.abrirTicket({
          nombre: row.nombre,
          plan: row.descripcion || row.categoria,
          categoria: row.categoria,
          monto: row.monto,
          fecha: row.fecha,
          cartera: row.cartera,
          meses: null,
          expiracion: null,
          operationId: row.operation_id || '—',
          empleado: row.usuario
        });
      })
      .catch(function(e) {
        alert('Error buscando movimiento: ' + e.message);
      });
  };

  console.log('✅ Elemental Club — Ticket System cargado');

})();
