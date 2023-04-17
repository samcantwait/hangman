import { nationalParks, words, country, animals, city } from "./categories.js";

const categoryChoices = { 'nationalParks': nationalParks, 'words': words, 'country': country, 'animals': animals, 'city': city }

let letterPush, letterArr = [], guesses = 7, starting = [],
    categoryString, num, word, chosenLength, category;

const notCapitalized = ['animals', 'words', 'aviation', 'colors', 'food', 'plants', 'musicalInstruments'];

const wordDiv = document.querySelector('#wordDiv');
const categoryDiv = document.querySelector('#categories');
const alphabet = document.querySelector('#alphabet');
const remaining = document.querySelector('#guesses');
const hint = document.querySelector('#hint');
const theWord = document.querySelector('#word');
const definition = document.querySelector('#definition');

const joinWithSpace = arr => arr.join('').replaceAll(5, '&nbsp;&nbsp;');
const joinReplace = arr => arr.join('').replaceAll(5, '').toLowerCase();

const hide = () => {
    alphabet.style.display = 'none';
    definition.style.display = 'none';
    hint.style.display = 'none';
    theWord.style.display = 'none';
};

const wordFunction = () => {
    wordDiv.style.display = 'flex';
    wordDiv.addEventListener('click', e => {
        if (e.target.className) {
            let wordLength = e.target.innerText;
            createWordLen(wordLength);
        }
    });
};
const createWordLen = wordLength => {
    category = "words";
    categoryString = 'words';
    num = Math.floor(Math.random() * (words[wordLength - 3].length));
    word = words[wordLength - 3][num];
    wordDiv.style.display = 'none';
    guessWord(word);

};

// Randomly select word based on chosen category
categoryDiv.addEventListener('click', e => {
    if (e.target.value) {
        let choice = e.target.value;
        categoryDiv.style.display = 'none';
        if (choice === 'words') {
            wordFunction();
        } else {
            category = categoryChoices[choice];
            categoryString = choice;
            // category = eval('(' + categoryString + ')');
            if (choice === 'nationalParks') {
                num = Math.floor(Math.random() * Object.keys(category).length);
                word = Object.keys(category)[num];
            } else {
                num = Math.floor(Math.random() * category.length)
                word = category[num];
            }
            guessWord(word);
        }
    }
});

const guessWord = word => {
    // Draw lines representing characters in the word
    for (let letter in word) {
        if (word[letter] === " ") {
            starting.push('5');
        } else {
            starting.push('_');
        }
    }
    remaining.style.display = 'block';
    remaining.innerText = `Guesses remaining: ${guesses}`;
    hint.style.display = 'block';
    theWord.innerHTML = joinWithSpace(starting);
    console.log(word);
    theWord.style.display = 'block';
    alphabet.style.display = 'flex';

    // Add keyboard functionality
    document.body.addEventListener('keyup', (e) => {
        if (/^[a-zA-Z]*$/.test(e.key) && e.key.length === 1) {
            letterPush = e.key.toLowerCase();
            if (letterArr.indexOf(letterPush) === -1) {
                selectedLetter(letterPush);
                letterArr.push(letterPush);
            }
        }
    });

    // Add click functionality
    alphabet.addEventListener('click', e => {
        let letter = e.target.id;
        if (letter !== 'alphabet' && letter !== 'guesses') {
            selectedLetter(letter);
            letterArr.push(letter);
        }
    });


    // Replace letters in word/subtract guesses.
    const selectedLetter = selectedLetter => {
        document.getElementById(selectedLetter).disabled = true;
        if (word.toLowerCase().indexOf(selectedLetter) === -1) {
            guesses--;
            remaining.innerText = `Guesses remaining: ${guesses}`;
        }

        // Ensure capitalization for proper nouns
        for (let i = 0; i < word.length; i++) {
            if (selectedLetter === word[i].toLowerCase()) {
                if ((i === 0 || word[i - 1] === ' ') && notCapitalized.includes(categoryString) === false) {
                    starting[i] = selectedLetter.toUpperCase();
                } else {
                    starting[i] = selectedLetter;
                }
            }
        }

        // Check for a winner/loser based on entered characters/guesses.
        theWord.innerHTML = joinWithSpace(starting);
        if (joinReplace(starting) === word.replace(/\s/g, '').toLowerCase() && guesses > 0) {
            if (guesses === 6) {
                output.innerHTML = `Congratulations, you won!<p>The answer was <b>${starting.join('').replaceAll(5, ' ')}</b>. <br />It took you ${7 - guesses} incorrect guess.</p>`;
            } else {
                output.innerHTML = `Congratulations, you won!<p>The answer was <b>${starting.join('').replaceAll(5, ' ')}</b>. <br />It took you ${7 - guesses} incorrect guesses.</p>`;
            }
            hide();
            output.style.display = 'block';
        } else if (guesses === 0) {
            output.innerHTML = `You lose.<p>The answer was <b>${word.toUpperCase()}</b>.</p>`;
            hide();
            output.style.display = 'block';
        }
    };
};


// Display hints based on object values
hint.addEventListener('click', () => {
    definition.innerText = 'working on it...'
    hint.style.display = 'none';
    if (category == 'words') {
        //Use a dictionary API for word category hints
        const define = async (entry) => {
            try {
                const result = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${entry}`);
                const data = await result.json();
                defineText(data[0].meanings[0].partOfSpeech.toUpperCase(), data[0].meanings[0].definitions[0].definition)
            } catch {
                console.log('use a real word, Dood!')
            }
        }
        define(word);
        const defineText = (speech, def) => {
            definition.innerHTML = `${speech}:  ${def}`;
        }
        return;
    }
    if (categoryString === 'nationalParks') {
        definition.innerHTML = `${Object.values(category)[num]} <blockquote> --nps.gov </blockquote>`;
        return;
    }
    const findHint = async (name) => {
        try {
            const results = await fetch(`https://api.api-ninjas.com/v1/${categoryString}?name=${name}`, {
                method: 'GET',
                headers: { 'X-Api-Key': 'zJ0FvOeHLowyTLdi45LfIw==m23JekADZW4qSYuy' },
                contentType: 'application/json',
            })
            const data = await results.json();
            console.log(data)
            if (categoryString === 'country') {
                definition.innerHTML = `This country's capital is <b>${data[0].capital}</b> and it is located in <b>${data[0].region}</b>.`
            }
            if (categoryString === 'animals') {
                const index = data.findIndex(item => item.name === name);
                if (index === -1) { throw error }
                definition.innerHTML = `<b>Habitat or location:</b> ${data[index].characteristics.habitat ?? data[index].locations} <br /> <b>Food:</b> ${data[index].characteristics.prey ?? data[index].characteristics.main_prey ?? data[index].characteristics.diet ?? "I don't know what they eat!"}`
            }
            if (categoryString === 'city') {
                definition.innerHTML = `I doubt this will help, but here ya go- <br/ > <b>Longitude:</b> ${data[0].longitude} <br /> <b>Latitude:</b> ${data[0].latitude} <br /> <b>Population:</b> ${data[0].population}`
            }
        } catch {
            console.log('error in fetch request');
            definition.innerText = `Sorry, there is no hint available.`
        }
    }
    findHint(word)
})