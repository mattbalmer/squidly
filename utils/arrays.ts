import { random } from 'squidly/utils/math';

export function randomElement(array) {
  return array[Math.floor(random() * array.length)];
};

export function mostFrequentElements<T = any>(array: T[], getKey: (element: T, i: number) => string): {
  count: number,
  value: T,
}[] {
  const tallies = {};

  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    const key = getKey(element, i);
    if (tallies[key]) {
      tallies[key].count++
    } else {
      tallies[key] = {
        count: 1,
        value: element,
      };
    }
  }

  let mostFrequentCount = 0;
  let mostFrequentElements = [];

  for(let key in tallies) {
    if (tallies[key].count >= mostFrequentCount) {
      mostFrequentElements.push(tallies[key]);
      mostFrequentCount = tallies[key].count;
    }
  }

  console.log(tallies)
  
  return mostFrequentElements;
};
