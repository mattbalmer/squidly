import { random } from 'squidly/utils/math';

export function randomElement(array) {
  return array[Math.floor(random() * array.length)];
}