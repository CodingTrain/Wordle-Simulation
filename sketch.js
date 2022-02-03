const guesses = [{}, {}, {}, {}, {}, {}];

const BLACK = 0;
const GREEN = 1;
const YELLO = 2;

let target;

let data;
let allWords = {};
let round = 0;

function preload() {
  // data = ['AAHED', 'SHERE', 'HELLO']; //
  data = loadStrings('5letters.txt');
}

function validWords(lastGuess) {
  const options = [];
  for (let i = 0; i < data.length; i++) {
    const word = data[i];

    // Check if guessed
    if (allWords[word].guessed) continue;
    //console.log(word, lastGuess.word);
    //console.log(lastGuess.results);

    // Check if all greens match
    let greensMatch = true;
    for (let j = 0; j < lastGuess.results.length; j++) {
      if (lastGuess.results[j] == GREEN && word.charAt(j) !== lastGuess.word.charAt(j)) {
        greensMatch = false;
      }
    }
    if (!greensMatch) continue;

    // Does this word include any BLACK letters
    let noEliminated = true;
    for (let j = 0; j < lastGuess.results.length; j++) {
      if (lastGuess.results[j] == BLACK) {
        const c = lastGuess.word.charAt(j);
        let countOK = 0;
        for (let k = 0; k < lastGuess.word.length; k++) {
          if (lastGuess.word.charAt(k) == c && lastGuess.results[k] > 0) {
            countOK++;
          }
        }
        countC = 0;
        for (let k = 0; k < word.length; k++) {
          if (word.charAt(k) == c) countC++;
        }
        if (countC > countOK) noEliminated = false;
      }
    }
    if (!noEliminated) continue;

    // Are any yellows the same?
    let sameYellow = false;
    for (let j = 0; j < lastGuess.results.length; j++) {
      if (lastGuess.results[j] == YELLO && word.charAt(j) == lastGuess.word.charAt(j)) {
        sameYellow = true;
      }
    }
    if (sameYellow) continue;

    // Are we also matching the yellows in new spots?
    let yellowsGood = true;
    for (let j = 0; j < lastGuess.results.length; j++) {
      if (lastGuess.results[j] == YELLO) {
        let c = lastGuess.word.charAt(j);
        let foundYellow = false;
        for (let k = 0; k < word.length; k++) {
          if (word.charAt(k) == c && k !== j) {
            foundYellow = true;
          }
        }
        if (!foundYellow) {
          yellowsGood = false;
          break;
        }
      }
    }
    if (!yellowsGood) continue;

    // We made it this far!
    options.push(word);
  }
  return options;
}

function pickWord() {
  if (round == 0) {
    return random(data);
  }
  const lastGuess = guesses[round - 1];
  const options = validWords(lastGuess);
  console.log(options);
  return random(options);
}

function evaluateWord(word, target) {
  allWords[word].guessed = true;
  // Now evaluate that word?
  let results = [BLACK, BLACK, BLACK, BLACK, BLACK];
  // Check for greens
  let matched = [false, false, false, false, false];
  for (let i = 0; i < word.length; i++) {
    const current = word.charAt(i);
    if (current == target.charAt(i)) {
      results[i] = GREEN;
      matched[i] = true;
    }
  }
  // Check for yellows
  for (let i = 0; i < word.length; i++) {
    const current = word.charAt(i);
    // Check if the letter is anywhere else
    for (let j = 0; j < target.length; j++) {
      if (target.charAt(j) == current && results[i] !== GREEN && !matched[j]) {
        results[i] = YELLO;
        matched[j] = true;
        break;
      }
    }
  }
  return results;
}

function nextGuess() {
  // Now evaluate
  const word = pickWord();
  const results = evaluateWord(word, target);
  guesses[round] = {
    word,
    results,
  };
  redraw();
  round++;
}

function setup() {
  createCanvas(200, 400);
  target = random(data);
  console.log(target);

  textFont('Courier');
  for (let i = 0; i < data.length; i++) {
    const word = data[i];
    allWords[word] = {
      guessed: false,
    };
  }
  nextGuess();
  createButton('guess').mousePressed(nextGuess);
}

function draw() {
  background(51);
  const w = 20;
  const h = 20;
  translate(w, h);
  for (let j = 0; j < guesses.length; j++) {
    const { word, results } = guesses[j];
    for (let i = 0; i < target.length; i++) {
      stroke(255);
      if (results) {
        const status = results[i];
        if (status == GREEN) {
          fill(0, 100, 0);
        } else if (status == YELLO) {
          fill(150, 150, 0);
        } else {
          fill(0);
        }
      } else {
        fill(0);
      }
      rectMode(CENTER);
      rect(i * w, j * h, w, h);
      textAlign(CENTER, CENTER);
      fill(255);
      noStroke();
      if (word) text(word.charAt(i), i * w, j * h);
    }
  }
  noLoop();
}
