// Initialize current phase index
// 0: Spirit phase
// 1: Fast power
// 2: Blight
// 3: Event
// 4: Fear
// 5: Invader
// 6: Slow power
// 7: time passes

const { event } = require("jquery");

var phase = 0;
var playerCount = 0;
var adversary = '';
var adversaryLevel = 0;

var phaseList = null;
var phaseListLength = 8;
var maxPhaseListHeight = 4;
// Headings for phase list
var phaseListDict = {
    0: 'Spirit Phase',
    1: 'Fast Powers',
    2: 'Blighted Island',
    3: 'Events',
    4: 'Fear Cards',
    5: 'Invader Phase',
    6: 'Slow Powers',
    7: 'Time Passes'
};

var fearProgress = null;
var leftBarFearBadge = null;
var phaseListFearBadge = null;
var fear = 0;
var earnedFearCards = 0;
var fearMax = 8;

var cardDisplay = null;

var invaderCardExplore = null;
var invaderCardBuild = null;
var invaderCardRavage = null;
var invaderCardFourth = null;
var ravageBadge = null;
var buildBadge = null;
var exploreBadge = null;

var invaderLevelSeq = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3];
var invaderSeq = []; // [1s, 1w, 2c ... ]

var turn = 0;

var fearSeq = Array(50);
var fearSeqIndex = 0;
var eventSeq = Array(62);
var eventSeqIndex = 0;

var ls = window.localStorage;
// ls.getItem('key');
// ls.setItem('key', 'value');

// Initialisations
$(function() {

    init();

    // Logic about game setup. 

    // If localstorage info present, read them via init(). Fill in blanks by init generation. 
    if (ls.getItem('game')) {
        init();
    }
    // If no localstorage info, initiate setup popup
    else {
        
        setup();
    }
    
});

function init() {

    invaderCardExplore = $('#invader-card-explore');
    invaderCardBuild = $('#invader-card-build');
    invaderCardRavage = $('#invader-card-ravage');
    invaderCardFourth = $('#invader-card-fourth');
    clearInvaderCard();

    phaseList = $('#phase-list');
    fearProgress = $('#fear-progress');
    cardDisplay = $('#main-card-display');
    leftBarFearBadge = $('#left-bar-fear-badge');

    $('#btn-next-phase').on('click', function() {
        nextStep();
    });

    // Handle adversary selection and preview in setup modal
    $('.adversary-radio').on('change', function() {
        const selectedAdversary = $(this).val();
        const imagePath = $(this).data('image');

        console.log(selectedAdversary,imagePath);
        
        if (selectedAdversary !== 'none' && imagePath) {
            // Show adversary level selector
            $('#adversaryLevelGroup').slideDown();
            
            // Update preview with image
            const previewHTML = `
                <img src="./assets/adversary/${imagePath}" 
                     class="game-card adversary-preview-image">
            `;
            $('#adversaryPreview').html(previewHTML);
        } else {
            // Hide adversary level selector
            $('#adversaryLevelGroup').slideUp();
            
            // Show placeholder
            $('#adversaryPreview').html(`
                <div class="preview-placeholder">
                    <i class="text-muted">No adversary selected</i>
                </div>
            `);
        }
    });

    $('#startGameBtn').on('click', function() {
        if (validateSetupForm()) {
            setup();
            $('#gameSetupModal').modal('hide');
        }
    });

    //Start from first invader phase (explore only)
    updatePhaseList(4);
    nextStep();
}

function nextStep() {

    // Check before phase advance: if at fear card phase and still has unresolved fear card, 
    // do not advance phase
    if (phase === 4 && earnedFearCards > 0) {
        drawCard('fear');
        earnedFearCards--;
        updateFearBadge();
    }

    updatePhaseList((phase + 1) % phaseListLength);

    // Clear main display if moving away from draw card phase
    let clearDisplayPhases = [0, 1, 2, 5, 6, 7];
    if (clearDisplayPhases.includes((phase + 1) % phaseListLength)) {
        clearCardDisplay();
    }

    if (phase === 3) {
        drawCard('event');
    }

    if (phase === 4) {
        if (earnedFearCards === 0) {
            // Skip fear card phase if there is no earned fear card
            updatePhaseList((phase + 1) % phaseListLength);
        }
        else {
            drawCard('fear');
            earnedFearCards--;
            updateFearBadge();
        }
    }

    // Invader phase: flip explore card
    if (phase === 5) {
        updateInvaderCard(true);
        updateInvaderBadge(true);
    }

    // Slow power phase: advance invader card
    if (phase === 6) {
        clearInvaderCard();
        turn++;
        updateInvaderCard(false);
        updateInvaderBadge(false);
        turn--;
        if (turn === 0) {
            updatePhaseList((phase + 2) % phaseListLength);
            turn++;
        }
    }

    // Time passes: advance turn counter
    if (phase === 7) {
        turn++;
    }

    save();
}

function addFear() {
    fear ++;

    if (fear === fearMax) {
        earnFearCard();
    }

    if (fear >= fearMax || fear < 0) {
        fear = 0;
    }
    
    fearProgress.attr('style', 'width: ' + fear / fearMax * 100 + '%');
    fearProgress.html(fear + ' / ' + fearMax);
}

function removeFear() {
    fear --;

    if (fear < 0) {
        return;
    }
}

function earnFearCard() {
    earnedFearCards ++;
    updateFearBadge();
}

function updateFearBadge() {
    if (earnedFearCards == 0) {
        phaseListFearBadge.hide();
    }
    else {
        phaseListFearBadge.show();
    }

    leftBarFearBadge.html(earnedFearCards);
    phaseListFearBadge.html(earnedFearCards);
}

// Function to draw and display a random card
function drawCard(type) {

    let img = document.createElement('img');

    img.classList.add('game-card');

    switch (type)
    {
        case 'fear':
            img.src = `./assets/fear/${fearSeq[fearSeqIndex]}.jpg`;
            fearSeqIndex++;
            break;
        case 'event':
            img.src = `./assets/event/${eventSeq[eventSeqIndex]}.jpg`;
            eventSeqIndex++;
            break;
    }

    clearCardDisplay();
    cardDisplay.append(img);
}

// Code to update phase list DOM, used by nextStep function
function updatePhaseList(newPhase) {

    phase = newPhase;

    let children = $('.list-group-item', phaseList).removeClass('list-group-item-dark');
    for (let i = 0; i < children.length; i++) {
        if (i === 1) {
            continue;
        }
        children[i].remove();
    }

    let phaseIndex = 0;

    // Make phase list dynamic HTML
    for (let i = 0; i < maxPhaseListHeight; i++) {
        // Preserve the element showing the last phase
        if (i === 0 && phaseList.children().length > 0) continue;

        phaseIndex = (i + phase - 1) % phaseListLength;

        if (phaseIndex < 0) phaseIndex = 7;

        // Make list item container
        let listItem = $(document.createElement('div'))
            .addClass('list-group-item d-flex justify-content-between align-items-center');

        // Make heading
        let heading = $('<b></b>')
            .addClass('phase-list-title')
            .html(phaseListDict[phaseIndex])
            .appendTo(listItem);

        if (i == 1) {
            // Second item in list is current phase. 
            listItem.addClass('list-group-item-dark');
        }

        if (phaseIndex === 0) {
            // Spirit phase special texts
            listItem.removeClass('d-flex');
            $('<ul></ul>')
                .append('<li>Growth options</li>')
                .append('<li>Gain energy</li>')
                .append('<li>Choose and pay for cards</li>')
                .appendTo(listItem);
        }
        else if (phaseIndex === 4) {
            // Fear card phase special texts (fear badge)
            $('<span></span>')
                .addClass('badge badge-primary rounded-pill fear-badge')
                .attr('id', 'phase-list-fear-badge')
                .appendTo(listItem);
            if (earnedFearCards === 0) {
                heading.addClass('text-body-tertiary');
            }
        }
        else if (phaseIndex === 5) {
            // Invader phase texts
            listItem.removeClass('d-flex');
            $('<ul style="list-style-type:none; padding-left: 20px;"></ul>')
                .append('<li>Ravage: <span class="badge" id="phase-list-ravage-badge"> </span> </li>')
                .append('<li>Build: <span class="badge" id="phase-list-build-badge"> </span> </li>')
                .append('<li>Explore: <span class="badge" id="phase-list-explore-badge"> </span> </li>')
                .appendTo(listItem);
        }
        else if (phaseIndex === 6) {
            // Grey text out if game just started (skipping)
            if (turn === 0) {
                heading.addClass('text-body-tertiary');
            }
        }
        else if (phaseIndex === 7) {
            if (turn === 0) {
                heading.addClass('text-body-tertiary');
            }
        }

        if (i === 0) {
            // Grey out last step text
            listItem.addClass('text-body-tertiary');
        }

        phaseListFearBadge = $('#phase-list-fear-badge');
        updateFearBadge();

        // Add generated list item to phase list DOM
        listItem.appendTo(phaseList);

        // Update variables to newly generated phase list DOM
        ravageBadge = $('#phase-list-ravage-badge');
        buildBadge = $('#phase-list-build-badge');
        exploreBadge = $('#phase-list-explore-badge');
        updateInvaderBadge();

    }   
}

function save() {
    const gameData = {
        playerCount: playerCount,
        adversary: adversary,
        adversaryLevel: adversaryLevel,
        phase: phase
    };
    
    localStorage.setItem('gameData', JSON.stringify(gameData));
    console.log('Game setup saved:', gameSetup);
}

function setup() {

    ls.clear();

    fearSeq = generateSeq(50);
    eventSeq = generateSeq(62);
    generateInvaderSeq(invaderLevelSeq);

    const gameData = {
        playerCount: $('input[name="playerCount"]:checked').val(),
        adversary: $('input[name="adversary"]:checked').val(),
        adversaryLevel: $('#adversaryLevel').val() || 0,
        invaderSeq: invaderSeq,
        fearSeq: fearSeq,
        fearSeqIndex: fearSeqIndex,
        eventSeq: eventSeq,
        eventSeqIndex: eventSeqIndex,
        phase: phase
    };
    
    localStorage.setItem('gameData', JSON.stringify(gameData));
    console.log('Game setup saved:', gameSetup);
}

function load() {

}

function startNewGame() {
    if (confirm('Start a new game? This will erase your current game.')) {
        localStorage.clear();
        location.reload();
    }
}

function clearCardDisplay() {
    cardDisplay.empty();
}

function clearInvaderCard() {
    invaderCardExplore.empty();
    invaderCardBuild.empty();
    invaderCardRavage.empty();
    invaderCardFourth.empty();
}

function updateInvaderCard(showExplore) {

    clearInvaderCard();

    invaderCards = [invaderCardExplore, invaderCardBuild, invaderCardRavage, invaderCardFourth];

    for (let i = 0; i < 4; i++) {
        if (i > turn) return;

        let img = document.createElement('img');
        img.classList.add('game-card', 'game-card-invader');
        if (i === 0 && !showExplore) {
            img.src = `./assets/invader/${invaderLevelSeq[turn]}.jpg`;
        }
        else {
            img.src = `./assets/invader/${invaderSeq[turn - i]}.jpg`;
        }
        invaderCards[i].append(img);
    }
}

function generateInvaderSeq(levelSeq) {

    let level1 = ['1w', '1s', '1j', '1m'];
    let level2 = ['2w', '2s', '2j', '2m', '2c'];
    let level3 = ['3js', '3jw', '3mj', '3mw', '3sm', '3sw'];

    invaderSeq = [];
    let index = 0;

    for (let i = 0; i < levelSeq.length; i++) {
        level = levelSeq[i];
        if (level === 1) {
            index = Math.floor(Math.random() * level1.length);
            invaderSeq.push(level1[index]);
            level1.splice(index, 1);
        } 
        else if (level === 2) {
            index = Math.floor(Math.random() * level2.length);
            invaderSeq.push(level2[index]);
            level2.splice(index, 1);
        }
        else if (level === 3) {
            index = Math.floor(Math.random() * level3.length);
            invaderSeq.push(level3[index]);
            level3.splice(index, 1);
        }
    }
}

function generateSeq(n) {
    let output = Array(n);
    let orderedArray = Array.from({ length: n }, (_, i) => i);

    for (let i = 0; i < n; i++) {
        let random = Math.floor(Math.random() * (n-i));
        output[i] = orderedArray[random];
        orderedArray.splice(random, 1);
    }
    
    return output;
}

function generateBadge(terrain) {
    // Terrain should be single character
    // 'u' means unknown terrain
    // 'n' means none
    let b = $(document.createElement('span'));
    b.addClass('badge');
    
    switch (terrain) {
        case 'j': 
            b.css('background-color', '#26a56a');
            b.css('color','#fff');
            b.html('Jungle');
            break;
        case 'm': 
            b.css('background-color', '#858585');
            b.css('color','#fff');
            b.html('Mountain');
            break;
        case 's': 
            b.css('background-color', '#ffd26a');
            b.css('color','#000');
            b.html('Sand');
            break;
        case 'w': 
            b.css('background-color', '#73dcdf');
            b.css('color','#000');
            b.html('Wetland');
            break;
        case 'u': 
            b.css('background-color', '#ffffff');
            b.css('color','#000000');
            b.css('border-color', '#000');
            b.css('border-style', 'solid');
            b.css('border-width', '1px');
            b.html('Unknown');
            break;
        case 'n': 
            b.html('None');
            break;
    }

    return b;
}

function updateInvaderBadge(showExplore) {

    ravageBadge.empty();
    buildBadge.empty();
    exploreBadge.empty();

    badges = [exploreBadge, buildBadge, ravageBadge];

    let level = 0;

    for (let i = 0; i < 3; i++) {

        // Explore badge first
        let levelIndex = turn - i;
        if (levelIndex < 0) {
            badges[i].append(generateBadge('n'))
            continue;
        }

        // If show explore is false, append 'unknown' badge and move on
        if (i === 0 && !showExplore) {
            exploreBadge.append(generateBadge('u'));
            continue;
        }

        level = invaderLevelSeq[levelIndex];

        if (level === 1 || level === 2) {
            badges[i].append(generateBadge(invaderSeq[turn - i][1]));
        }
        else if (level === 3) {
            badges[i].append(generateBadge(invaderSeq[turn - i][1]), generateBadge(invaderSeq[turn - i][2]));
        }
    
    }

}

// Validate the setup form
function validateSetupForm() {
    const playerCount = $('input[name="playerCount"]:checked').val();
    const adversary = $('input[name="adversary"]:checked').val();
    
    if (!playerCount) {
        alert('Please select number of players');
        return false;
    }
    
    if (!adversary) {
        alert('Please select an adversary option');
        return false;
    }
    
    return true;
}