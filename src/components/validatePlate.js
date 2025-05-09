// validatePlates.js

// Función para validar una placa individual
export const validatePlate = (plate) => {
  const states = [
    { state: 'Aguascalientes', range: ['AAA', 'AFZ'] },
    { state: 'Baja California', range: ['AGA', 'CYZ'] },
    { state: 'Baja California Sur', range: ['CZA', 'DEZ'] },
    { state: 'Campeche', range: ['DFA', 'DKZ'] },
    { state: 'Chihuahua', range: ['DTA', 'ETZ'] },
    { state: 'Chiapas', range: ['DLA', 'DSZ'] },
    { state: 'Coahuila', range: ['EUA', 'FPZ'] },
    { state: 'Colima', range: ['FRA', 'FWZ'] },
    { state: 'Durango', range: ['FXA', 'GFZ'] },
    { state: 'Guanajuato', range: ['GGA', 'GYZ'] },
    { state: 'Guerrero', range: ['GZA', 'HFZ'] },
    { state: 'Hidalgo', range: ['HGA', 'HRZ'] },
    { state: 'Jalisco', range: ['HSA', 'LFZ'] },
    { state: 'Estado de México', range: ['LGA', 'PEZ'] },
    { state: 'Michoacán', range: ['PFA', 'PUZ'] },
    { state: 'Morelos', range: ['PVA', 'RDZ'] },
    { state: 'Nayarit', range: ['REA', 'RJZ'] },
    { state: 'Nuevo León', range: ['RKA', 'TGZ'] },
    { state: 'Oaxaca', range: ['THA', 'TMZ'] },
    { state: 'Puebla', range: ['TNA', 'UJZ'] },
    { state: 'Querétaro', range: ['UKA', 'UPZ'] },
    { state: 'Quintana Roo', range: ['URA', 'UVZ'] },
    { state: 'San Luis Potosí', range: ['UWA', 'VEZ'] },
    { state: 'Sinaloa', range: ['VFA', 'VSZ'] },
    { state: 'Sonora', range: ['VTA', 'WKZ'] },
    { state: 'Tabasco', range: ['WLA', 'WWZ'] },
    { state: 'Tamaulipas', range: ['WXA', 'XSZ'] },
    { state: 'Tlaxcala', range: ['XTA', 'XXZ'] },
    { state: 'Veracruz', range: ['XYA', 'YVZ'] },
    { state: 'Yucatán', range: ['YWA', 'ZCZ'] },
    { state: 'Zacatecas', range: ['ZDA', 'ZHZ'] },
    { state: 'Ciudad de México', range: ['A01', 'Z99'] },
  ];

  // Limpiar la placa y convertirla a mayúsculas
  const formattedPlate = plate.toUpperCase().replace(/ /g, '');

  // Verificar que la placa tiene el formato correcto (Ej: AAA-001, AAA-00-01, AAA-001-A)
  const platePattern1 = /^[A-Z]{3}-\d{3}$/; // AAA-001
  const platePattern2 = /^[A-Z]{3}-\d{2}-\d{2}$/; // AAA-00-01
  const platePattern3 = /^[A-Z]{3}-\d{3}-[A-Z]{1}$/; // AAA-001-A
  const cdmxPattern = /^[A-Z0-9]{3}-[A-Z]{3}$/; // A01-AAA a Z99-ZZZ

  // Verificar los formatos
  if (platePattern1.test(formattedPlate) || platePattern2.test(formattedPlate) || platePattern3.test(formattedPlate)) {
    // Si la placa coincide con el formato estándar, verificar el estado
    const prefix = formattedPlate.split('-')[0];
    for (let state of states) {
      const [start, end] = state.range;
      if (prefix >= start && prefix <= end) {
        return { valid: true, state: state.state };
      }
    }
    return { valid: false, message: "Estado no encontrado" };
  } else if (cdmxPattern.test(formattedPlate)) {
    // Si es una placa de Ciudad de México
    return { valid: true, state: 'Ciudad de México' };
  } else {
    return { valid: false, message: 'Formato de placa no válido' };
  }
};

// Función para validar varias placas
export const validatePlates = (plates) => {
  const validated = [];
  const unvalidated = [];
  
  plates.forEach(plate => {
    const result = validatePlate(plate); // Usamos la función de validación de placas
    if (result.valid) {
      validated.push({ plate, state: result.state }); // Si es válida, se agrega a las placas verificadas
    } else {
      unvalidated.push({ plate, message: result.message }); // Si no es válida, se agrega a las no verificadas
    }
  });
  
  return { validated, unvalidated }; // Retorna las placas verificadas y no verificadas
};
