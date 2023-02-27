/**
 * Returns an incremented version if a string already exists
 *
 * @example
 * If the name already exists in the given collection, it adds a counter to the name
 * ```ts
 * uniqueName('Petra', ['Petra', 'Frank']) // returns 'Petra (1)'
 * ```
 */
export default (name: string, existingNames: string[]): string => {
  const regex = new RegExp(`^(${name}\\s\\(\\d\\)|${name})$`);
  const matches = existingNames.filter(existName => existName.match(regex));
  return matches.length ? `${name} (${matches.length})` : name;
};
