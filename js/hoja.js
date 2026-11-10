// Hoja del calendario litúrgico de hoy, propia de la Diócesis de Daule.
// Los datos salen del motor LitCal (Manna Sacerdotalis): data/calendario/daule-AAAA.js
(function () {
  var huecos = document.querySelectorAll('[data-hoja]');
  if (!huecos.length) return;

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var GRADO = { solemnity: 'Solemnidad', feast: 'Fiesta', memorial: 'Memoria', triduum: 'Triduo Pascual' };
  var TIEMPO = { ordinary: 'Tiempo Ordinario', advent: 'Adviento', christmas: 'Navidad', lent: 'Cuaresma', easter: 'Pascua' };
  var COLOR = {
    green: ['verde', '#1F7A3A', '#FFFFFF'], white: ['blanco', '#F4EBD0', '#0C2A14'], violet: ['morado', '#5B2A86', '#FFFFFF'],
    red: ['rojo', '#C0281C', '#FFFFFF'], rose: ['rosa', '#D98AA6', '#0C2A14']
  };
  var PROPIO = { 'ec-dau': 'Propio de la diócesis', ec: 'Propio del Ecuador', lat: 'América Latina' };

  // Fecha de hoy en la hora de Ecuador, esté donde esté quien visita la página
  var p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
  // Para probar otro día: index.html?fecha=2026-12-09
  var prueba = /^(\d{4})-(\d{2})-(\d{2})$/.exec(new URLSearchParams(location.search).get('fecha') || '');
  if (prueba) p = { year: prueba[1], month: prueba[2], day: prueba[3] };
  var clave = p.year + '-' + p.month + '-' + p.day;
  var fecha = new Date(Date.UTC(+p.year, +p.month - 1, +p.day));

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function fechaLarga(iso) {
    var a = iso.split('-');
    return (+a[2]) + ' de ' + MESES[+a[1] - 1];
  }

  function pintar() {
    var d = ((window.CALENDARIO || {})[p.year] || {})[clave];
    if (!d) return;                                   // sin datos para hoy: la hoja no se muestra
    var col = COLOR[d.c] || COLOR.green;
    huecos.forEach(function (hueco) {
      var hoja = el('div', 'hoja-papel');
      var cab = el('div', 'hoja-cab', DIAS[fecha.getUTCDay()]);
      cab.style.background = col[1]; cab.style.color = col[2];
      hoja.appendChild(cab);
      hoja.appendChild(el('div', 'hoja-num', String(+p.day)));
      hoja.appendChild(el('div', 'hoja-mes', MESES[+p.month - 1] + ' ' + p.year));

      var txt = el('div', 'hoja-texto');
      txt.appendChild(el('p', 'hoja-rotulo', 'Hoy en la liturgia'));
      txt.appendChild(el('p', 'hoja-nombre', d.n));
      if (d.sub) txt.appendChild(el('p', 'hoja-sub', d.sub.charAt(0).toUpperCase() + d.sub.slice(1)));
      var datos = [];
      if (GRADO[d.t]) datos.push(GRADO[d.t]);
      if (PROPIO[d.src] && !d.sub) datos.push(PROPIO[d.src]);
      if (TIEMPO[d.s]) datos.push(TIEMPO[d.s]);
      datos.push('color ' + col[0]);
      txt.appendChild(el('p', 'hoja-datos', datos.join(' · ')));
      if (d.tr) txt.appendChild(el('p', 'hoja-nota', 'Este año se traslada desde el ' + fechaLarga(d.tr) + '.'));
      if (d.op) txt.appendChild(el('p', 'hoja-nota', 'También se puede recordar: ' + d.op.join('; ') + '.'));

      hueco.textContent = '';
      hueco.appendChild(hoja);
      hueco.appendChild(txt);
      hueco.hidden = false;
    });
  }

  var s = document.createElement('script');
  s.src = 'data/calendario/daule-' + p.year + '.js';
  s.onload = pintar;
  document.head.appendChild(s);
})();
