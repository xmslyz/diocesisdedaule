// Hoja del calendario litúrgico de hoy, propia de la Diócesis de Daule,
// con el aspecto de la hoja de Manna Sacerdotalis.
// Los datos salen del motor LitCal: data/calendario/daule-AAAA.js (solo hechos del calendario).
(function () {
  var huecos = document.querySelectorAll('[data-hoja]');
  if (!huecos.length) return;

  var DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
    'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV'];
  var GRADO = { solemnity: 'Solemnidad', feast: 'Fiesta', memorial: 'Memoria', triduum: 'Triduo Pascual', sunday: 'Domingo', commemoration: 'Conmemoración' };
  var TIEMPO = { ordinary: 'Tiempo Ordinario', advent: 'Adviento', christmas: 'Navidad', lent: 'Cuaresma', easter: 'Pascua' };
  // nombre del color y color del punto (el blanco se marca en dorado, como en Manna)
  var COLOR = { green: ['verde', '#2FA84F'], white: ['blanco', '#A98743'], violet: ['morado', '#8E3BC9'], red: ['rojo', '#D93030'], rose: ['rosa', '#E191AE'] };
  var PROPIO = { 'ec-dau': 'propio de la diócesis', ec: 'propio del Ecuador', lat: 'América Latina' };

  function iso(f) { return f.toISOString().slice(0, 10); }
  function dato(f) { return ((window.CALENDARIO || {})[String(f.getUTCFullYear())] || {})[iso(f)]; }
  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  // Fecha de hoy en la hora de Ecuador, esté donde esté quien visita la página
  var p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
  // Para probar otro día: index.html?fecha=2026-12-09
  var prueba = /^(\d{4})-(\d{2})-(\d{2})$/.exec(new URLSearchParams(location.search).get('fecha') || '');
  if (prueba) p = { year: prueba[1], month: prueba[2], day: prueba[3] };
  var hoy = new Date(Date.UTC(+p.year, +p.month - 1, +p.day));

  // Semana de domingo a sábado
  var semana = [];
  for (var i = 0; i < 7; i++) semana.push(new Date(hoy.getTime() + (i - hoy.getUTCDay()) * 86400000));

  function pintar() {
    var d = dato(hoy);
    if (!d) return;                                   // sin datos para hoy: la hoja no se muestra
    var col = COLOR[d.c] || COLOR.green;
    huecos.forEach(function (hueco) {
      var caja = el('div', 'hoja-caja');

      var dia = el('div', 'hoja-dia');
      dia.appendChild(el('div', 'hoja-sem', DIAS[hoy.getUTCDay()]));
      dia.appendChild(el('div', 'hoja-num', String(hoy.getUTCDate())));
      var t = TIEMPO[d.s] || '';
      dia.appendChild(el('div', 'hoja-tiempo', (d.w ? 'Semana ' + (ROMANOS[d.w] || d.w) + ' · ' : '') + t));
      dia.appendChild(el('div', 'hoja-mes', MESES[hoy.getUTCMonth()] + ' de ' + hoy.getUTCFullYear() + (d.p ? ' · salterio ' + ROMANOS[d.p] : '')));
      caja.appendChild(dia);

      var tira = el('ol', 'hoja-tira');
      semana.forEach(function (f) {
        var x = dato(f), li = el('li');
        var fuerte = f.getUTCDay() === 0 || (x && x.t === 'solemnity');
        if (fuerte) li.className = 'fuerte';
        if (f.getTime() === hoy.getTime()) { li.className += ' hoy'; li.setAttribute('aria-current', 'date'); }
        li.appendChild(el('span', 'tira-dia', DIAS[f.getUTCDay()]));
        li.appendChild(el('span', 'tira-num', String(f.getUTCDate())));
        var punto = el('span', 'tira-punto');
        if (x) { punto.style.background = (COLOR[x.c] || COLOR.green)[1]; li.title = x.n; }
        else punto.style.visibility = 'hidden';
        li.appendChild(punto);
        tira.appendChild(li);
      });
      caja.appendChild(tira);

      var cel = el('div', 'hoja-cel');
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

      hueco.textContent = '';
      hueco.appendChild(caja);
      hueco.hidden = false;
    });
  }

  // Carga el año de hoy y, si la semana cruza de año, también el vecino
  var anios = {};
  semana.concat([hoy]).forEach(function (f) { anios[f.getUTCFullYear()] = true; });
  var lista = Object.keys(anios), faltan = lista.length;
  lista.forEach(function (a) {
    var s = document.createElement('script');
    s.src = 'data/calendario/daule-' + a + '.js';
    s.onload = s.onerror = function () { if (--faltan === 0) pintar(); };
    document.head.appendChild(s);
  });
})();
