const ROWS = [
  ["Camila Herrera", "35128456", "camila.herrera@gmail.com", "2645550182", "auxiliar-docente-preceptor", "presencial", "Tarde", "nuevo", "pendiente", 0, ""],
  ["Lautaro Gómez", "38910234", "lautaro.gomez@hotmail.com", "2645552044", "electricista-instalador", "presencial", "Noche", "nuevo", "pendiente", 1, "Dejó el DNI para fotocopiar"],
  ["Valentina Ruiz", "40112887", "valen.ruiz@gmail.com", "2645553310", "excel-profesional", "virtual", "A tu ritmo", "nuevo", "pendiente", 1, ""],
  ["Mateo Fernández", "37884512", "mateo.fernandez@gmail.com", "2645554471", "auxiliar-farmacia", "hibrido", "Noche", "contactado", "sena", 2, "Confirmó la clase de noche por Zoom"],
  ["Nicolás Figueroa", "36550921", "nico.figueroa@yahoo.com", "2645556628", "enfermeria-domiciliaria", "presencial", "Tarde", "contactado", "pendiente", 3, "Preguntó por las prácticas"],
  ["Sofía Acosta", "39441002", "sofia.acosta@gmail.com", "2645557783", "auxiliar-docente-preceptor", "presencial", "Tarde", "inscripto", "aprobado", 3, ""],
  ["Joaquín Páez", "41220338", "joaquin.paez@gmail.com", "2645558801", "electricista-instalador", "presencial", "Noche", "inscripto", "aprobado", 4, ""],
  ["Lucía Benítez", "35667190", "lucia.benitez@hotmail.com", "2645559914", "secretariado-escolar", "hibrido", "Tarde", "contactado", "pendiente", 5, "No atendió el llamado del 14/11"],
  ["Thiago Molina", "42339015", "thiago.molina@gmail.com", "2645561022", "tecnico-refrigeracion", "presencial", "Tarde", "inscripto", "aprobado", 6, ""],
  ["Martina Díaz", "37001456", "martina.diaz@gmail.com", "2645562140", "excel-profesional", "presencial", "Mañana", "inscripto", "aprobado", 8, "Pidió factura A"],
  ["Facundo Herrera", "40558231", "facu.herrera@gmail.com", "2645563255", "auxiliar-farmacia", "presencial", "Tarde", "inscripto", "aprobado", 9, ""],
  ["Abril Soria", "38882004", "abril.soria@gmail.com", "2645564308", "recursos-humanos", "hibrido", "Noche", "inscripto", "aprobado", 10, ""],
  ["Josefina Leiva", "36110448", "josefina.leiva@gmail.com", "2645565419", "secretariado-escolar", "presencial", "Mañana", "inscripto", "aprobado", 11, ""],
  ["Benjamín Castro", "41776220", "benjamin.castro@outlook.com", "2645566527", "operador-pc", "virtual", "A tu ritmo", "inscripto", "aprobado", 12, ""],
  ["Emilia Quiroga", "34998012", "emilia.quiroga@gmail.com", "2645567633", "enfermeria-domiciliaria", "presencial", "Mañana", "inscripto", "aprobado", 13, ""],
  ["Bautista Luna", "43001567", "bautista.luna@gmail.com", "2645568744", "organizacion-eventos", "presencial", "Tarde", "contactado", "sena", 14, "Viene con dos compañeras, grupo de 3"],
  ["Renata Ibáñez", "38224119", "renata.ibanez@gmail.com", "2645569850", "auxiliar-docente-preceptor", "virtual", "A tu ritmo", "inscripto", "aprobado", 15, ""],
  ["Pedro Alaniz", "39993450", "pedro.alaniz@hotmail.com", "2645570961", "liquidacion-sueldos", "virtual", "A tu ritmo", "inscripto", "aprobado", 16, ""],
  ["Santino Vega", "37445028", "santino.vega@gmail.com", "2645571072", "electricista-instalador", "presencial", "Noche", "inscripto", "aprobado", 18, ""],
  ["Catalina Moyano", "40881236", "cata.moyano@gmail.com", "2645572184", "liquidacion-sueldos", "hibrido", "Noche", "inscripto", "aprobado", 20, ""],
  ["Franco Delgado", "35550987", "franco.delgado@gmail.com", "2645573290", "tecnico-refrigeracion", "presencial", "Noche", "baja", "aprobado", 22, "Se dio de baja: cambia de ciudad"],
  ["Julieta Navarro", "42110054", "julieta.navarro@gmail.com", "2645574301", "secretariado-medico", "virtual", "A tu ritmo", "inscripto", "aprobado", 25, ""],
  ["Ignacio Ríos", "36667841", "ignacio.rios@yahoo.com", "2645575418", "oratoria", "presencial", "Noche", "inscripto", "aprobado", 28, ""],
  ["Pilar Godoy", "41334502", "pilar.godoy@gmail.com", "2645576526", "excel-profesional", "hibrido", "Tarde", "inscripto", "aprobado", 30, ""],
  ["Tomás Aguirre", "38001267", "tomas.aguirre@gmail.com", "2645577639", "auxiliar-farmacia", "presencial", "Mañana", "inscripto", "aprobado", 35, ""],
  ["Bianca Flores", "42778810", "bianca.flores@gmail.com", "2645578745", "capacitacion-docente", "virtual", "A tu ritmo", "contactado", "pendiente", 40, ""],
  ["Ramiro Pinto", "35220994", "ramiro.pinto@hotmail.com", "2645579852", "aires-acondicionados", "presencial", "Tarde", "inscripto", "aprobado", 45, ""],
  ["Olivia Carrizo", "40445671", "olivia.carrizo@gmail.com", "2645580960", "secretariado-ejecutivo", "hibrido", "Tarde", "inscripto", "aprobado", 48, ""],
  ["Gael Méndez", "37112308", "gael.mendez@gmail.com", "2645581077", "operador-pc", "presencial", "Tarde", "inscripto", "aprobado", 55, ""],
  ["Delfina Ortiz", "41990026", "delfina.ortiz@gmail.com", "2645582183", "auxiliar-docente-preceptor", "presencial", "Noche", "inscripto", "aprobado", 60, ""],
  ["Bruno Salinas", "36334415", "bruno.salinas@gmail.com", "2645583294", "excel-profesional", "virtual", "A tu ritmo", "baja", "pendiente", 70, "No completó el pago"],
  ["Alma Pereyra", "39556780", "alma.pereyra@gmail.com", "2645584308", "recursos-humanos", "presencial", "Tarde", "inscripto", "aprobado", 75, ""],
]

function createdAt(daysBefore) {
  return new Date(Date.UTC(2026, 10, 16 - daysBefore, 15, 0, 0)).toISOString()
}

export function createEnrollments(catalog) {
  const byId = new Map(catalog.map((course) => [course.id, course]))

  return ROWS.map((row, index) => {
    const [name, dni, email, phone, courseId, modality, shift, status, payment, days, notes] = row
    const course = byId.get(courseId)
    return {
      id: `enr-${String(index + 1).padStart(2, "0")}`,
      createdAt: createdAt(days),
      name,
      dni,
      email,
      phone,
      courseId,
      modality,
      shift,
      status,
      payment,
      amount: course ? course.matricula + course.cuota : 0,
      notes,
      source: "ejemplo",
      code: `RL-${dni.slice(-6)}`,
    }
  })
}
