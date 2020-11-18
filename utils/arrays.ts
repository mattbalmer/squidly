import { random } from 'squidly/utils/math';

export function randomElement(array) {
  return array[Math.floor(random() * array.length)];
};

export function mostFrequentElement(array) {
  const tallies = {};

  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    tallies[element] = (tallies[element] !== undefined ? tallies[element] + 1 : 1)
  };

  let mostFrequentCount = 0;
  let mostFrequentElement = undefined;

  for(let element in tallies) {
    if (tallies[element] > mostFrequentCount) {
      mostFrequentElement = element
      mostFrequentCount = tallies[element]
    };
  };
  
  return mostFrequentElement;
};