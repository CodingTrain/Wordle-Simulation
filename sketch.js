let guesses = [];

const BLACK = 0;
const GREEN = 1;
const YELLO = 2;

let target;

let allWords = {};
let round = 0;

let totalCounts = [0, 0, 0, 0, 0, 0, 0];

let answers, guessWords;

function preload() {
  //data = ['AAHED', 'SHERE', 'HELLO']; //
  answers = loadStrings('answers.txt');
  guessWords = loadStrings('guesses.txt');
}

function validWords(guesses) {
  const options = [];

  for (let i = 0; i < guessWords.length; i++) {
    const word = guessWords[i].toUpperCase();

    let allGood = true;
    if (allWords[word].guessed) {
      allGood = false;
      continue;
    }

    for (let lastGuess of guesses) {
      if (!lastGuess.results) break;
      // Check if all greens match
      let greensMatch = true;
      for (let j = 0; j < lastGuess.results.length; j++) {
        if (lastGuess.results[j] == GREEN && word.charAt(j) !== lastGuess.word.charAt(j)) {
          greensMatch = false;
        }
      }
      if (!greensMatch) {
        allGood = false;
        break;
      }

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
      if (!noEliminated) {
        allGood = false;
        break;
      }

      // Are any yellows the same?
      let sameYellow = false;
      for (let j = 0; j < lastGuess.results.length; j++) {
        if (lastGuess.results[j] == YELLO && word.charAt(j) == lastGuess.word.charAt(j)) {
          sameYellow = true;
        }
      }
      if (sameYellow) {
        allGood = false;
        break;
      }

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
      if (!yellowsGood) {
        allGood = false;
        break;
      }
    }

    // This word is valid!
    if (allGood) {
      options.push(word);
    }
  }
  return options;
}

let guessCounter = 0;
function pickWord() {
  if (round == 0) {
    return guessWords[guessCounter].toUpperCase();
  }
  const options = validWords(guesses);
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
}

let answerCounter = 0;
let allDone = false;
function startOver() {
  if (answerCounter == answers.length) {
    allDone = true;
    return;
  }
  round = 0;
  target = answers[answerCounter].toUpperCase();
  answerCounter++;
  // console.log(target);

  textFont('Courier');
  for (let i = 0; i < guessWords.length; i++) {
    const word = guessWords[i].toUpperCase();
    allWords[word] = {
      guessed: false,
    };
  }

  for (let i = 0; i < 6; i++) {
    guesses[i] = {};
  }
}

function setup() {
  createCanvas(300, 180);
  guessWords = guessWords.concat(answers);
  startOver();
  // frameRate(30);
  // createButton('guess').mousePressed(nextGuess);
}

let completed = false;

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
      // rectMode(CENTER);
      rect(i * w, j * h, w, h);
      textAlign(CENTER, CENTER);
      textSize(12);
      fill(255);
      noStroke();
      if (word) text(word.charAt(i), i * w + w * 0.5, j * h + h * 0.5);
    }
  }

  let score = 0;
  for (let i = 0; i < totalCounts.length; i++) {
    stroke(255);
    strokeWeight(0.5);
    fill(175);
    rect(7 * w, i * h + 1, totalCounts[i] * 0.15, h - 2);
    textAlign(LEFT, CENTER);
    fill(255);
    noStroke();
    textSize(8);
    text(totalCounts[i], 5 * w + w * 0.5, i * h + h * 0.5);
    score += (i + 1) * totalCounts[i];
  }

  let avg = score / answerCounter;
  text('avg placement: ' + nf(avg, 1, 4), 0, 6.5 * h + h * 0.5);
  text(`total games: ${answerCounter}`, 0, 7.0 * h + h * 0.5);

  if (allDone) {
    save(`${guessWords[guessCounter]}.png`);
    noLoop();
  }

  // Play the actual game
  for (let i = 0; i < 100; i++) {
    if (!allDone) {
      let allGreen = true;
      let completed = false;
      if (round > 0) {
        const { results } = guesses[round - 1];
        for (let i = 0; i < results.length; i++) {
          if (results[i] !== GREEN) allGreen = false;
        }
        if (allGreen || round == 6) {
          if (!allGreen) round++;
          totalCounts[round - 1]++;
          completed = true;
          startOver();
        }
      }
      if (!allDone) {
        nextGuess();
      } else {
        break;
      }
      round++;
    }
  }
}
