export const valueAtPath = <T extends any>(obj: object, path: string): T => {
  const [head, ...parts] = path.split('.');
  if(head && parts.length === 0) {
    return obj[head];
  } else if(!head && parts.length === 0) {
    return undefined;
  } else {
    return valueAtPath(obj[head], parts.join('.'));
  }
};
