document.addEventListener(`DOMContentLoaded`, function () { onLoad(); } );
window.addEventListener("mousedown", function (e) { clicked( e ); } );
window.addEventListener("keydown", function(e) { pressed( e ) } );
window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });

var  settings = {
    letters: 5
}
var round = {
    letters: []
    , strikes: 0
    , score: 0
    , words: []
    , input: ``
}
var game = {
    round: 1
    , changing: false
    , hiScore: 0
}


function onLoad(){
    loadGame();
    document.querySelector(`.underlay`).innerHTML = niceNumber( game.hiScore );
    primeDictionary();
    pickLetters();
    giveLetters();
    checkSubmit();
}

function clicked( e ){
    if( !game.changing ){
        let c = e.target.classList;
        if( c.contains(`tile`) ){
            typeLetter( e.target.getAttribute(`data-letter`) );
        }
        else if( c.contains(`submit`) ){ submitWord(); }
        else if( c.contains(`backspace`) ){ backspace(); }
        else if( c.contains(`jumble`) ){ jumbleLetters(); }
    }
}
function pressed( e ){
    if( !game.changing ){
        if( e.key == `Enter` ){ submitWord(); }
        else if( e.key == `Backspace` ){ backspace(); }
        else if( round.letters.indexOf( e.key.toUpperCase() ) > -1 ){
            typeLetter( e.key.toUpperCase() );
        }
    }
}

function giveLetters(){
    for( let i = 0; i < round.letters.length; i++ ){
        let t = document.getElementById(`tiles`).children[i];
        t.innerHTML = round.letters[i];
        t.setAttribute(`data-letter`,round.letters[i]);
    }
}

function pickLetters(){
    let o = [];
    for( let i = 0; i < 5; i++ ){
        let b = 1824;
        for( k in o ){ b -= letters[o[k]].freq; }
        for( q in letters ){
            if( o.filter( e => e == letters[q].str ).length > 0 ){}
            else if( Math.floor( Math.random() * b ) <= letters[q].freq ){
                o.push( letters[q].str );
                break;
            }
            else{ b -= letters[q].freq; }
        }
    }
    let hasVowel = false;
    for( k in o ){ if( letters[o[k]].vowel ){ hasVowel = true; break; } }
    if( !hasVowel ){
        let budget = 692;
        for( l in letters ){
            if( letters[l].vowel ){
                if( Math.floor( Math.random() * budget ) <= letters[l].freq ){
                    o[4] = letters[l].str; 
                    break;
                }
                else{ budget -= letters[l].freq; }
            }
        }
    }
    round.letters = o;
}

function typeLetter( q ){
    round.input += q;
    refreshInput();
    checkSubmit();
}

function refreshInput(){
    document.getElementById(`input`).innerHTML = round.input + `<a class="blink">_</a>`
}

function submitWord(){
    if( round.input.length <= 1 && round.input !== `A` && round.input !== `I` ){}
    else if( round.input.length < 3 ){}
    else if( round.words.indexOf( round.input ) == -1 ){
        if( dictionary[round.input.length].indexOf( round.input ) > -1 ){
            gainScore( round.input.length );
            round.words.push( round.input );
            clearInput();
        }
        else{
            gainStrike();
            clearInput();
        }
    }
    else if( round.words.indexOf( round.input ) !== -1 ){ // already guessed
        clearInput();
    }
    checkSubmit();
}

function backspace(){
    if( round.input.length > 0 ){
        round.input = round.input.slice(0,round.input.length - 1);
        refreshInput();
    }
    checkSubmit();
}

function jumbleLetters(){
    round.letters = shuffle( round.letters );
    giveLetters();
}

function gainScore( n ){
    round.score += Math.pow( n, 2 );
    updateScoreDisplay();
    if( round.score >= 100 ){
        newRound();
    }
}

function gainStrike(){
    round.strikes++;
    if( round.strikes >= 3 ){ gameOver(); }
    updateStrikesDisplay();
}

function clearInput(){
    round.input = ``;
    refreshInput();
}

function updateScoreDisplay(){
    document.getElementById(`score`).innerHTML = `Score: ` + niceNumber( round.score );
}

function updateStrikesDisplay(){
    document.getElementById(`strikes`).innerHTML = `Strikes: ` + niceNumber( round.strikes );
}

function updateRoundDisplay(){
    document.getElementById(`rounds`).innerHTML = `Round ` + niceNumber( game.round );
}

function checkSubmit(){
    if( round.input.length >= 3 ){ document.querySelector(`.submit`).classList.remove(`locked`) }
    else{ document.querySelector(`.submit`).classList.add(`locked`) }
}

function newRound( gameOver ){
    game.changing = true;
    let t = document.querySelectorAll(`.tile`);
    for( let i = 0; i < t.length; i++ ){ t[i].classList.add( `fade` ); }
    document.getElementById(`score`).classList.add(`fade`);
    document.getElementById(`strikes`).classList.add(`fade`);
    game.round++;
    if( game.round - 1 > game.hiScore ){
        game.hiScore = game.round - 1;
        document.querySelector(`.underlay`).innerHTML = niceNumber( game.hiScore );
    }
    updateRoundDisplay();
    saveState();
    setTimeout(() => {
        pickLetters();
        giveLetters();
        round.strikes = 0;
        round.score = 0;
        // round.score -= 100;
        // if( gameOver ){ round.score = 0; }
        round.words = [];
        round.input = ``;
        updateScoreDisplay();
        updateStrikesDisplay();
        game.changing = false;
        checkSubmit();
    }, 1000 );
    setTimeout(() => {
        let t = document.querySelectorAll(`.fade`);
        for( let i = 0; i < t.length; i++ ){ t[i].classList.remove( `fade` ); }
    }, 2000 );
}

function gameOver(){
    game.round = 0;
    document.getElementById(`rounds`).classList.add(`fade`);
    newRound( true );
}

function primeDictionary(){
    const d = new Date();
    let start = d.getTime();
    for( w in dict ){
        if( dict[w].split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; }).join('').length <= settings.letters ){
            dictionary[dict[w].length].push(dict[w]);
        }
    }
    const dd = new Date();
    let end = dd.getTime();
    let delta = end - start;
    console.log( `Dictionary ready in ${delta}ms.` )
}

function saveState(){
    localStorage.setItem( `game` , JSON.stringify( game ) );
    localStorage.setItem( `settings` , JSON.stringify( game ) );
}

function hardReset(){
    localStorage.clear();
    location.reload();
}

function loadGame(){
    let g = {};
    if( JSON.parse( localStorage.getItem( `game` ) ) !== null ){
        g = JSON.parse( localStorage.getItem( `game` ) );
    };
    if( g.hiScore !== undefined ){ game.hiScore = g.hiScore; }
    let s = {};
    if( JSON.parse( localStorage.getItem( `settings` ) ) !== null ){
        s = JSON.parse( localStorage.getItem( `settings` ) );
    };
    if( s.letters !== undefined ){
        settings.letters = s.letters;
    }
}






var si = ["","k","M","B","T","q","Q","s","S","O","D"];

function niceNumber( x ){
    let o = ``;
    if( x < 1000 && x > -1000 ){ o = rounding(x,0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }
    else{ o = abbrevNum( x ) };
    return o;
}

function abbrevNum(number){
    let neg = false;
    if( number < 0 ){
        neg = true;
        number = Math.abs( number );
    }
    var tier = Math.log10(number) / 3 | 0;
    if(tier == 0) return number;
    var suffix = si[tier];
    var scale = Math.pow(10, tier * 3);
    var scaled = number / scale;
    return ( neg ? `-` : `` ) + scaled.toPrecision(4) + suffix;
}

function rounding(value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
    return Math.round(value);  
    value = +value;
    exp = +exp;  
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
    return NaN;
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

function shuffle( array ) {
    for( let i = array.length - 1; i > 0; i-- ){
      let j = Math.floor(Math.random() * ( i + 1 ) );
      [array[i], array[j]] = [array[j], array[i]];
    };
    return array;
}