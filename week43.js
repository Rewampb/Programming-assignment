// Hello.
// This is a set of exercises.
// The idea is to practice a few things at a time.
// You do this by writing your answer after a task is given (see the example).
// Use the concepts from our sylabus. 

// DO NOT change the provided code unless the task specifically says to do so.

/* -----------------------------------------------------------------------------
    Task: Example
    Write code to print all the names in the list, one name per line
*/
console.log("Task: Example");
const people = ["Tony", "Christian", "Håkon"]

for (let index = 0; index < people.length; index++) {
    let person = people[index];
    console.log(person);
}

/* -----------------------------------------------------------------------------
    Task: A
    create a function that "draws" a tree of a given height.
    Example the following is a tree of height 5

           5        *
           4       ***
           3      *****
           2     *******
           1        x
*/
console.log("Task: A");
function drawTree(height) {
    for (let i = 0; i < height-1; i++) {
        const stars = '*'.repeat(2 * i + 1);
        console.log(`${height - i} ${stars.padStart(height + i, ' ')}`);
    }
    console.log(`1 ${'x'.padStart(height, ' ')}`);
}
drawTree(5);
/* -----------------------------------------------------------------------------
    Task: B

    Write a function that "draws" an arrow of a given size.
    Example: This is an arrow of size 3.

    *
    * *
    * * *
    * *
    * 
*/
console.log("Task: B");
function drawArrow(size) {
    for (let i = 0; i < size; i++) {
        console.log('* '.repeat(i).trim());
    }
    for (let i = size; i > 0; i--) {
        console.log('* '.repeat(i).trim());
    }
}
drawArrow(3);
/* -----------------------------------------------------------------------------
    Task: C
    Write a function that draws a box of n by m dimensions. Take into acount the diffrence in aspectratio.

    Example: This is a aproximatly a 2 by 2 box. 
    +--------+
    |        |
    |        |
    +--------+
*/
console.log("Task: C");
function drawBox(n, m) {
    const width = m * 3;
    console.log('+' + '-'.repeat(width) + '+');
    
    for (let i = 0; i < n; i++) {
        console.log('|' + ' '.repeat(width) + '|');
    }

    console.log('+' + '-'.repeat(width) + '+');
}
drawBox(2, 2);

/* -----------------------------------------------------------------------------
    Task: D
    Write a function that returns true if a word is a Heterogram.   
*/
console.log("Task: D");
function isHeterogram(word) {
    const cleanWord = word.toLowerCase();
    const letters = new Set();

    for (const letter of cleanWord) {
        if (letters.has(letter)) {
            return false;
        }
        letters.add(letter);
    }
    return true;
}
console.log(isHeterogram("Chair"));
console.log(isHeterogram("Hello"));

/* -----------------------------------------------------------------------------
    Task: E
    Write a function that returns true if two words are Anagrams.
*/
console.log("Task: E");
function areAnagrams(word1, word2) {
    const cleanWord1 = word1.toLowerCase();
    const cleanWord2 = word2.toLowerCase();

    if (cleanWord1.length !== cleanWord2.length) {
        return false;
    }

    const sortWord1 = cleanWord1.split('').sort().join('');
    const sortWord2 = cleanWord2.split('').sort().join('');

    return sortWord1 === sortWord2;
}

console.log(areAnagrams("Players", "Parsley"));
console.log(areAnagrams("Chair", "Table"));
