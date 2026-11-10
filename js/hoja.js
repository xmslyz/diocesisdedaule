// Hoja del calendario litúrgico, propia de la Diócesis de Daule, con el aspecto de la hoja de Manna Sacerdotalis.
// Los datos salen del motor LitCal: data/calendario/daule-AAAA.js (solo hechos del calendario, ningún texto litúrgico).
//
//   <aside class="hoja" data-hoja hidden></aside>   hoja del día, con la semana (días y flechas se pueden pulsar)
//   data-hoja="sin-semana"                          la misma hoja sin la tira de la semana
//   <div data-mes></div>                            cuadrícula del mes (opcional)
//
// Al elegir un día se lanza en document el evento «hoja:dia» con detail = 'AAAA-MM-DD'.
(function () {
  var huecos = document.querySelectorAll('[data-hoja]');
  var cuadros = document.querySelectorAll('[data-mes]');
  if (!huecos.length && !cuadros.length) return;

  var DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
    'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV'];
  var GRADO = { solemnity: 'Solemnidad', feast: 'Fiesta', memorial: 'Memoria', triduum: 'Triduo Pascual', sunday: 'Domingo', commemoration: 'Conmemoración' };
  var TIEMPO = { ordinary: 'Tiempo Ordinario', advent: 'Adviento', christmas: 'Navidad', lent: 'Cuaresma', easter: 'Pascua' };
  // nombre del color y color del punto (el blanco se marca en dorado, como en Manna)
  var COLOR = { green: ['verde', '#2FA84F'], white: ['blanco', '#A98743'], violet: ['morado', '#8E3BC9'], red: ['rojo', '#D93030'], rose: ['rosa', '#E191AE'] };
  var PROPIO = { 'ec-dau': 'propio de la diócesis', ec: 'propio del Ecuador', lat: 'América Latina' };
  var DIA = 86400000;

  function iso(f) { return f.toISOString().slice(0, 10); }
  function dato(f) { return ((window.CALENDARIO || {})[String(f.getUTCFullYear())] || {})[iso(f)]; }
  function mas(f, n) { return new Date(f.getTime() + n * DIA); }
  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function boton(clase, texto, rotulo, alPulsar) {
    var b = el('button', clase, texto);
    b.type = 'button';
    if (rotulo) b.setAttribute('aria-label', rotulo);
    b.addEventListener('click', alPulsar);
    return b;
  }
  function fuerte(f, x) { return f.getUTCDay() === 0 || (x && x.t === 'solemnity'); }
  function rotuloDia(f, x) {
    return DIAS_LARGO[f.getUTCDay()] + ' ' + f.getUTCDate() + ' de ' + MESES[f.getUTCMonth()] + (x ? ': ' + x.n : '');
  }

  // Carga de años bajo demanda
  var pedidos = {};
  function cargar(anios, listo) {
    var faltan = 0;
    anios.forEach(function (a) {
      if (pedidos[a] === 'ok') return;
      faltan++;
      if (!pedidos[a]) {
        pedidos[a] = [];
        var s = document.createElement('script');
        s.src = 'data/calendario/daule-' + a + '.js';
        s.onload = s.onerror = function () { var cola = pedidos[a]; pedidos[a] = 'ok'; cola.forEach(function (f) { f(); }); };
        document.head.appendChild(s);
      }
      pedidos[a].push(function () { if (--faltan === 0) listo(); });
    });
    if (!faltan) listo();
  }

  // Hoy en la hora de Ecuador, esté donde esté quien visita la página
  var p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
  // Para probar otro día: index.html?fecha=2026-12-09
  var prueba = /^(\d{4})-(\d{2})-(\d{2})$/.exec(new URLSearchParams(location.search).get('fecha') || '');
  if (prueba) p = { year: prueba[1], month: prueba[2], day: prueba[3] };
  var hoy = new Date(Date.UTC(+p.year, +p.month - 1, +p.day));
  var sel = hoy;                                         // día que se está mirando
  var mesVisto = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1));

  function semanaDe(f) {
    var s = [];
    for (var i = 0; i < 7; i++) s.push(mas(f, i - f.getUTCDay()));
    return s;
  }

  // Cambia el día que se mira (si hay datos para él)
  function elegir(f, foco) {
    var anios = {};
    semanaDe(f).forEach(function (x) { anios[x.getUTCFullYear()] = 1; });
    cargar(Object.keys(anios), function () {
      if (!dato(f)) return;                              // fuera del calendario disponible
      sel = f;
      mesVisto = new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), 1));
      pintarHoja(foco);
      pintarMes();
      document.dispatchEvent(new CustomEvent('hoja:dia', { detail: iso(sel) }));
    });
  }

  function pintarHoja(foco) {
    var d = dato(sel);
    if (!d) return;
    var col = COLOR[d.c] || COLOR.green;
    huecos.forEach(function (hueco) {
      var caja = el('div', 'hoja-caja');

      var dia = el('div', 'hoja-dia');
      dia.appendChild(el('div', 'hoja-sem', DIAS[sel.getUTCDay()]));
      dia.appendChild(el('div', 'hoja-num', String(sel.getUTCDate())));
      dia.appendChild(el('div', 'hoja-tiempo', (d.w ? 'Semana ' + (ROMANOS[d.w] || d.w) + ' · ' : '') + (TIEMPO[d.s] || '')));
      dia.appendChild(el('div', 'hoja-mes', MESES[sel.getUTCMonth()] + ' de ' + sel.getUTCFullYear() + (d.p ? ' · salterio ' + ROMANOS[d.p] : '')));
      if (sel.getTime() !== hoy.getTime()) dia.appendChild(boton('hoja-volver', 'Volver a hoy', null, function () { elegir(hoy, 'dia'); }));
      caja.appendChild(dia);

      var nav = el('div', 'hoja-nav');
      nav.appendChild(boton('hoja-flecha', '‹', 'Semana anterior', function () { elegir(mas(sel, -7), 'ant'); }));
      var tira = el('ol', 'hoja-tira');
      semanaDe(sel).forEach(function (f) {
        var x = dato(f), li = el('li');
        var b = boton('tira-boton', null, rotuloDia(f, x), function () { elegir(f, 'dia'); });
        if (fuerte(f, x)) li.className = 'fuerte';
        if (f.getTime() === hoy.getTime()) li.className += ' hoy';
        if (f.getTime() === sel.getTime()) { li.className += ' sel'; b.setAttribute('aria-current', 'date'); }
        b.appendChild(el('span', 'tira-dia', DIAS[f.getUTCDay()]));
        b.appendChild(el('span', 'tira-num', String(f.getUTCDate())));
        var punto = el('span', 'tira-punto');
        if (x) { punto.style.background = (COLOR[x.c] || COLOR.green)[1]; b.title = x.n; }
        else { punto.style.visibility = 'hidden'; b.disabled = true; }
        b.appendChild(punto);
        li.appendChild(b);
        tira.appendChild(li);
      });
      nav.appendChild(tira);
      nav.appendChild(boton('hoja-flecha', '›', 'Semana siguiente', function () { elegir(mas(sel, 7), 'sig'); }));
      if (hueco.getAttribute('data-hoja') !== 'sin-semana') caja.appendChild(nav);   // con la cuadrícula del mes al lado, la semana sobra

      var cel = el('div', 'hoja-cel');
      cel.setAttribute('aria-live', 'polite');
      cel.appendChild(el('p', 'hoja-rotulo', 'Celebración'));
      cel.appendChild(el('p', 'hoja-nombre', d.n));
      var linea = [];
      if (GRADO[d.t]) linea.push(GRADO[d.t]);
      if (d.sub) linea.push(d.sub); else if (PROPIO[d.src]) linea.push(PROPIO[d.src]);
      linea.push(col[0]);
      cel.appendChild(el('p', 'hoja-grado', linea.join(' · ')));
      if (d.tr) cel.appendChild(el('p', 'hoja-nota', 'Este año se traslada desde el ' + (+d.tr.slice(8)) + ' de ' + MESES[+d.tr.slice(5, 7) - 1] + '.'));
      if (d.op) cel.appendChild(el('p', 'hoja-nota', 'También: ' + d.op.join('; ') + '.'));
      caja.appendChild(cel);

      var conFoco = foco && hueco.contains(document.activeElement);
      hueco.textContent = '';
      hueco.appendChild(caja);
      hueco.hidden = false;
      if (conFoco) {                                     // el teclado no pierde su sitio al repintar
        var q = foco === 'ant' ? '.hoja-flecha' : foco === 'sig' ? '.hoja-flecha:last-child' : '.sel .tira-boton';
        var destino = hueco.querySelector(q);
        if (destino) destino.focus();
      }
    });
  }

  function pintarMes() {
    if (!cuadros.length) return;
    var a = mesVisto.getUTCFullYear(), m = mesVisto.getUTCMonth();
    cargar([String(a)], function () {
      cuadros.forEach(function (cuadro) {
        var conFoco = cuadro.contains(document.activeElement);
        cuadro.textContent = '';
        var cab = el('div', 'mes-cab');
        cab.appendChild(boton('hoja-flecha', '‹', 'Mes anterior', function () { mesVisto = new Date(Date.UTC(a, m - 1, 1)); pintarMes(); }));
        cab.appendChild(el('div', 'mes-titulo', MESES[m] + ' de ' + a));
        cab.appendChild(boton('hoja-flecha', '›', 'Mes siguiente', function () { mesVisto = new Date(Date.UTC(a, m + 1, 1)); pintarMes(); }));
        cuadro.appendChild(cab);

        var rejilla = el('div', 'mes-rejilla');
        DIAS.forEach(function (n, i) { rejilla.appendChild(el('div', 'mes-dia' + (i === 0 ? ' fuerte' : ''), n)); });
        var primero = new Date(Date.UTC(a, m, 1));
        for (var v = 0; v < primero.getUTCDay(); v++) rejilla.appendChild(el('div'));
        var hay = false;
        for (var f = primero; f.getUTCMonth() === m; f = mas(f, 1)) {
          (function (f) {
            var x = dato(f);
            var b = boton('mes-boton', null, rotuloDia(f, x), function () { elegir(f); });
            if (fuerte(f, x)) b.className += ' fuerte';
            if (f.getTime() === hoy.getTime()) b.className += ' hoy';
            if (f.getTime() === sel.getTime()) { b.className += ' sel'; b.setAttribute('aria-current', 'date'); }
            b.appendChild(el('span', 'tira-num', String(f.getUTCDate())));
            var punto = el('span', 'tira-punto');
            if (x) { punto.style.background = (COLOR[x.c] || COLOR.green)[1]; b.title = x.n; hay = true; }
            else { punto.style.visibility = 'hidden'; b.disabled = true; }
            b.appendChild(punto);
            rejilla.appendChild(b);
          })(f);
        }
        cuadro.appendChild(rejilla);
        if (!hay) cuadro.appendChild(el('p', 'mes-vacio', 'Todavía no hay calendario para este mes.'));
        if (conFoco) { var s = cuadro.querySelector('.sel') || cuadro.querySelector('.hoja-flecha'); if (s) s.focus(); }
      });
    });
  }

  elegir(hoy);
})();
