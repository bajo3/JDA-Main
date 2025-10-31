export const toSlug = (s: string) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const vehicleToSlug = (v: any, index: number) => {
  const brand = String(v.Marca || v.Unidad || v.Brand || '').split(' ')[0] || 'auto';
  const model = String(v.Modelo || v.Model || v.Version || '').split(' ')[0] || 'modelo';
  const year = String(v.Año || v.Year || '').replace(/\D+/g, '') || 's-a';
  const km = String(v.KM || v.Kilometraje || v.Mileage || '').replace(/\D+/g, '');
  const base = [brand, model, year, km].filter(Boolean).join(' ');
  const slug = toSlug(base || `vehiculo-${index+1}`);
  return slug || `vehiculo-${index+1}`;
};
