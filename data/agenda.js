// Agenda diocesana. Para añadir un acto: copiar una línea y cambiar los datos.
//   desde / hasta: fechas AAAA-MM-DD (hasta es opcional)
//   titulo, detalle: texto que se muestra
// Los actos pasados dejan de mostrarse solos.
window.AGENDA = [
  { desde: "2026-11-13", hasta: "2026-11-21", titulo: "Novena a Cristo Rey", detalle: "En todas las parroquias de la diócesis." },
  { desde: "2026-11-28", titulo: "5.ª Peregrinación Juvenil Diocesana", detalle: "Pastoral Juvenil · «Creemos en ti». [LUGAR Y HORA]" },
  { desde: "2026-12-12", titulo: "Caravana Guadalupana a Daule", detalle: "Pastoral Provida. [RECORRIDO Y HORA]" },
  { desde: "2027-01-25", hasta: "2027-01-27", titulo: "IV Asamblea Diocesana", detalle: "Toda la diócesis evalúa el año y planifica el siguiente." },
  { desde: "2027-02-02", titulo: "Quinto aniversario de la diócesis", detalle: "La Diócesis de Daule fue erigida el 2 de febrero de 2022." }
];

// El año de la diócesis: lo que suele celebrarse cada mes (sin fechas exactas).
window.ANIO_DIOCESANO = [
  ["Enero", ["Asamblea Diocesana"]],
  ["Febrero", ["Aniversario de la diócesis (2 de febrero)"]],
  ["Marzo", ["Procesión por la Vida, en la Anunciación del Señor"]],
  ["Mayo", ["Mes de María"]],
  ["Junio", ["Procesión de Corpus Christi en Daule", "Novena y solemnidad del Sagrado Corazón de Jesús", "Aniversario de la ordenación episcopal de nuestro obispo (25 de junio)"]],
  ["Julio", ["Semana Vocacional", "Peregrinación con la Virgen del Carmen", "Jubileo de las Cuarenta Horas en la catedral", "Santa Ana, patrona de Samborondón (26 de julio)"]],
  ["Agosto", ["Santa Clara de Asís, patrona del cantón Daule", "San Jacinto, patrono de Balzar", "Gran Rifa Diocesana"]],
  ["Septiembre", ["Encuentro Juvenil Diocesano", "Fiestas del Señor de los Milagros, con procesión fluvial por el río Daule (14 de septiembre)"]],
  ["Octubre", ["Celebración diocesana de Santa Narcisa de Jesús en Nobol", "Encuentro Diocesano de Catequistas", "DOMUND"]],
  ["Noviembre", ["Responso por los fieles difuntos en el Cementerio General de Daule", "Novena a Cristo Rey", "Peregrinación Juvenil Diocesana"]],
  ["Diciembre", ["Santa Narcisa de Jesús, patrona de la diócesis: peregrinación al santuario de Nobol", "Caravana Guadalupana"]]
];
