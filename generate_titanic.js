// Run this script with: node generate_titanic.js
// It will create a data/titanic.json file with 200 synthetic passengers.

const fs = require('fs');
const path = require('path');

const sexes = ['male', 'female'];
const pclasses = [1, 2, 3];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

const passengers = [];
for (let i = 1; i <= 200; i++) {
  const Sex = randomChoice(sexes);
  const Pclass = randomChoice(pclasses);
  const Age = randomInt(1, 70);
  // Survival odds: females and higher class more likely to survive
  let Survived = 0;
  if (Sex === 'female' && (Pclass === 1 || Pclass === 2)) {
    Survived = Math.random() < 0.85 ? 1 : 0;
  } else if (Sex === 'female') {
    Survived = Math.random() < 0.7 ? 1 : 0;
  } else if (Pclass === 1) {
    Survived = Math.random() < 0.4 ? 1 : 0;
  } else {
    Survived = Math.random() < 0.2 ? 1 : 0;
  }
  passengers.push({ PassengerId: i, Survived, Pclass, Sex, Age });
}

const outPath = path.join(__dirname, 'data', 'titanic.json');
fs.writeFileSync(outPath, JSON.stringify(passengers, null, 2));
console.log('Generated', passengers.length, 'passengers to', outPath);
