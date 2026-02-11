export function kebabCase(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD') // Normalize to NFD to separate accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/([a-z])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase letters
    .replace(/[\s_]+/g, '-') // replace all spaces and low dash
    .replace(/[^a-z0-9-]/g, '') // remove non-alphanumeric chars
    .toLowerCase();
}
