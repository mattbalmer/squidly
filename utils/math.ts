import seedrandom from 'seedrandom';

export const random = (): number => {

  // I assume I had a good reason for this try-catch
  try {
    const srnd = seedrandom();
    return srnd.quick();
  } catch (e) {
    return Math.random();
  }
}