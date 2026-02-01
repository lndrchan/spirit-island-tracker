// Initialize current phase index
// 0: Spirit phase
// 1: Fast power
// 2: Blight
// 3: Event
// 4: Fear
// 5: Invader
// 6: Slow power
// 7: time passes

var phase = 0;
var playerCount = 0;
var adversary = '';
var adversaryLevel = 0;

var eventEnabled = true;

var phaseList = null;
var phaseCount = 8;
var phaseListDisplayLength = 4;
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

var fearProgressBar = null;
var leftBarFearBadge = null;
var phaseListFearBadge = null;
var leftBarFearCardBadges = null;
var leftBarFearCardsNextLevel = null;
var fear = 0;
var earnedFearCards = 0;
var maxFear = 0;
var fearLevelSeq = [];
var terrorLevel = 0; // 0 means terror level 1 and so on...

var cardDisplay = null;
var terrorLevelDisplay = null;

var invaderCardFourth;
var invaderCardRavage; 
var invaderCardBuild; 
var invaderCardExplore;
var invaderCards = [[],[],[],[]]; // Store invader codes

var ravageBadge = null;
var buildBadge = null;
var exploreBadge = null;

var invaderLevelSeq = [];
var invaderSeq = []; // [1s, 1w, 2c ... ]
var invaderSeqIndex = 0;

var turn = 0;
var turnRandomNumber = 0;

var fearSeq = Array(50);
var fearSeqIndex = 0;
var eventSeq = Array(62);
var eventSeqIndex = 0;

var saveIndex = 0;

var cardHistoryEventIndex;
var cardHistoryFearIndex;


// Special action-specific variables

var fracturedDaysPeekedType = 0; // 0 (invader) or 1 (event)

// Initialisations
$(function() {

    invaderCardExplore = $('#invader-card-explore');
    invaderCardBuild = $('#invader-card-build');
    invaderCardRavage = $('#invader-card-ravage');
    invaderCardFourth = $('#invader-card-fourth');

    phaseList = $('#phase-list');
    fearProgressBar = $('#fear-progress');
    cardDisplay = $('#main-card-display');
    leftBarFearBadge = $('#left-bar-fear-badge');
    leftBarFearCardBadges = $('.fear-cards-remaining-badge', '#fear-cards-remaining-container');
    leftBarFearCardsNextLevel = $('#fear-cards-next-level');

    terrorLevelDisplay = $('#terror-level-container')

    setupModal = $('#setup-modal');

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
            setupModal.modal('hide');
        }
    });

    // Logic about game setup. 

    // If localstorage info present, read them via load(). 
    if (localStorage.getItem('0')) {
        while (localStorage.getItem(`${saveIndex}`)) {
        saveIndex++;
    }
        saveIndex--;
        load(saveIndex);
    }
    // If no localstorage info, initiate setup popup
    else {
        setupModal.modal('show');
    }
});

// Function attached to next step button. 
// Checks if advance phase or if there are things that need resolving. 
function nextStep() {

    if (phase === 5 && turn === 0) {
        advancePhaseList(3); // Advance twice to skip to first spirit phase if it is turn 0
        advanceInvaderCard();
        turn++;
        updateUI();
        return;
    }

    // Check before phase advance: if at fear card phase and still has unresolved fear card, 
    // do not advance phase
    if (phase === 4 && earnedFearCards > 0) {
        drawCard('fear');
        earnedFearCards--;
        updateUI();
        return;
    }

    advancePhaseList(1);

    if (phase === 0) {
        turn++;
        turnRandomNumber = Math.random();
        $('#turn-count-display').html(turn);
        $('#total-turn-count-display').html(invaderLevelSeq.length);
    }

    if (phase === 3) {
        drawCard('event');
    }

    if (phase === 4) {
        $('.fear-btn').attr('disabled','');
        if (earnedFearCards === 0) {
            cardDisplay.html(`
                <div class="preview-placeholder cantora-one">
                    <i class="text-muted">No cards to resolve</i>
                </div>
            `);
        }
        else {
            drawCard('fear');
            earnedFearCards--;
            updateFearBadge();
        }
    }

    // Invader phase: flip explore card
    if (phase === 5) {
        $('.fear-btn').removeAttr('disabled');
        showExploreCard();
        updateInvaderBadge(true);
        showAdversaryCard();
    }

    // Slow power phase: advance invader card
    if (phase === 6) {
        advanceInvaderCard();
    }

    if (phase === 7) {
        
    }

    updateUI();
    save();
}

function addFear(count) {
    for (let i = 0; i < count; i++) {
        fear++;

        if (fear === maxFear) {
            earnFearCard();
        }

        if (fear >= maxFear || fear < 0) {
            fear = 0;
        }
    }

    updateUI();
    save();
}

function removeFear(count) {
    for (let i = 0; i < count; i++) {
        fear--;

        if (fear < 0) {
            if (earnedFearCards === 0) {
                fear = 0;
                return;
            } 
            removeFearCard();
            fear = maxFear - 1;
        }
    }

    fearProgressBar.attr('style', 'width: ' + fear / maxFear * 100 + '%');
    fearProgressBar.html(fear + ' / ' + maxFear);

    save();
}


function updateTerrorLevel() {

    if (terrorLevel >= 3) {
        alert('Fear Victory!');
    }
    
    terrorLevelDisplay.html(`
        <img class="game-card terror-level-display" src="assets/board/${terrorLevel+1}.jpg">
        <img class="game-card terror-level-display" src="assets/board/${terrorLevel+1}-vc.jpg">
        `)
}

function earnFearCard() {
    earnedFearCards++;

    fearLevelSeq[terrorLevel]--;
    if (fearLevelSeq[terrorLevel] === 0) {
        terrorLevel++;
        updateTerrorLevel();
    }

    updateFearBadge();
}

function addFearCard(count) {
    for (let i = 0; i < count; i++) fearLevelSeq[terrorLevel]++;
    updateUI();
}

function removeFearCard() {
    earnedFearCards--;
    fearLevelSeq[terrorLevel]++;
    if (fearLevelSeq[terrorLevel] === adversaryConfig[adversary]['fear'][adversaryLevel]) {
        terrorLevel--;
        updateTerrorLevel();
    }
    updateFearBadge();
}

function updateFearBadge() {

    if (phaseListFearBadge = $('#phase-list-fear-badge')) {
        if (earnedFearCards == 0) {
            phaseListFearBadge.hide();
        }
        else {
            phaseListFearBadge.show();
            phaseListFearBadge.html(earnedFearCards);
        }
    }

    leftBarFearBadge.html(earnedFearCards);

    for (let i = 0; i < 3; i++) {
        leftBarFearCardBadges[i].innerHTML = fearLevelSeq[i];
    }

    leftBarFearCardsNextLevel.html(fearLevelSeq[terrorLevel]);
}

// Function to draw and display a random card
function drawCard(type) {

    switch (type)
    {
        case 'fear':
            displayCard('fear', fearSeq[fearSeqIndex])
            cardHistoryFearIndex = fearSeqIndex;
            fearSeqIndex++;
            if (fearSeqIndex >= fearSeq.length) {
                fearSeq = generateSeq(fearSeq.length);
                fearSeqIndex = 0;
            }
            break;
        case 'event':
            displayCard('event', eventSeq[eventSeqIndex])
            cardHistoryEventIndex = eventSeqIndex;
            if (eventSeq[eventSeqIndex] === 1) alert(`Slave Rebellion has been drawn. After performing the printed actions, please choose how it will be resolved under the 'Special Actions' menu. `)
            eventSeqIndex++;
            if (eventSeqIndex >= eventSeq.length) {
                eventSeq = generateSeq(eventSeq.length);
                eventSeqIndex = 0;
            }
            break;
    }
}

function displayCard(type, id) {
    let img = document.createElement('img');
    img.classList.add('game-card');
    img.src = `./assets/${type}/${id}.jpg`;

    clearCardDisplay();
    cardDisplay.append(img);
}

function redraw() {
    if (phase === 3) {
        // Event card phase
        drawCard('event');
    }
    else if (phase === 4) {
        // Fear card phase
        drawCard('fear');
    }
}

// Remove first item of phase list and generate new phase list item at bottom of list
function advancePhaseList(count) {

    // If phase list empty, populate it before anything else
    if ($('.list-group-item', phaseList).length < phaseListDisplayLength) {
        advancePhaseList();
    }

    for (let i = 0; i < count; i++) {

        phase = (phase + 1) % phaseCount;

        let children = $('.list-group-item', phaseList);
        
        // Only perform children manipulation if phase list is fully populated
        if (children && children.length === phaseListDisplayLength) {
            // Delete list item for phase before previous phase
            children[0].remove();

            // List item for previous phase
            $(children[1]).removeClass('list-group-item-dark').addClass('text-body-tertiary');
            $(children[1]).children('.phase-list-title').nextAll().remove(); // Remove everything except for heading (first element)

            // List item for current phase
            $(children[2]).addClass('list-group-item-dark');
            // Add 'Current' phase marker to phase list
            $('.phase-list-title', children[2]).after('<span style="float: right;" class="badge rounded-pill bg-primary" id="current-badge"> <i>Current</i> </span>');
        }

        updateFearBadge();

        // Append new list item. Phase index is current phase + phase list display length
        let newPhaseListItemIndex = (phase + phaseListDisplayLength - 2) % phaseCount;
        phaseList.append(generatePhaseListItem(newPhaseListItemIndex));

        if (newPhaseListItemIndex === 5) {
            // Relink invader list item badges
            updateInvaderBadge();
        }

        console.log('Appended list item for phase ' + (phase + phaseListDisplayLength - 2) % phaseCount);

    }

    //console.log('Advanced phase by ' + count);
}

function advancePhaseList() {
    
    phaseList.empty();
    //console.log('Phase list emptied');
    for (let i = 0; i < phaseListDisplayLength; i++) {
        index = (phase - 1 + i < 0 ? phaseCount - 1 : (phase - 1 + i) % phaseCount);
        phaseList.append(generatePhaseListItem(index));
        //console.log('Emptied phase list appended list item for phase ' + index);
    }

}

function generatePhaseListItem(phaseIndex) {

    // Make list item container
    let listItem = $(document.createElement('div'))
        .addClass('list-group-item align-items-center');

    // Make heading
    let heading = $('<b></b>')
        .addClass('phase-list-title')
        .html(phaseListDict[phaseIndex])
        .appendTo(listItem);
    let phaseListIconContainer = $('<div></div>').addClass('phase-list-icon-container').prependTo(listItem);

    if (phaseIndex === phase) {
        listItem.addClass('list-group-item-dark')
    }
    if (phaseIndex === phase - 1) {
        heading.addClass('text-body-tertiary');
        return listItem;
    }
        
    if (phaseIndex === 0) {
        // Spirit phase special texts

        phaseListIconContainer.prepend($('<img src="./assets/symbol/token.png">')
            .addClass('phase-list-icon inverted'));

        $('<ul style="list-style-type:none; padding-left: 40px;margin-top: 0.5em;margin-bottom: 0em;"></ul>')
            .append('<li>Growth options</li>')
            .append('<li>Gain energy</li>')
            .append('<li>Choose and pay for cards</li>')
            .appendTo(listItem);
    }
    else if (phaseIndex === 1) {
        phaseListIconContainer.prepend($('<img src="./assets/symbol/fast.png">')
            .addClass('phase-list-icon brightness'));
    }
    else if (phaseIndex === 2) {
        phaseListIconContainer.prepend($('<img src="./assets/symbol/blight.png">')
            .addClass('phase-list-icon inverted'));
    }
    else if (phaseIndex === 4) {
        // Fear card phase special texts (fear badge)

        phaseListIconContainer.prepend($('<img src="./assets/symbol/fear.png">')
            .addClass('phase-list-icon inverted'));

        $('<span></span>')
            .addClass('badge text-bg-dark fear-badge')
            .attr('id', 'phase-list-fear-badge')
            .css('float', 'right')
            .html(earnedFearCards)
            .appendTo(listItem);
    }
    else if (phaseIndex === 5) {
        // Invader phase texts

        phaseListIconContainer.prepend($('<img src="./assets/symbol/explorer.png">')
            .addClass('phase-list-icon inverted'));

        listItem.removeClass('d-flex');
        let invaderPhaseDescription = $('<ul style="list-style-type:none; padding-left: 40px;margin-top: 0.5em;margin-bottom: 0em;"></ul>');
        invaderPhaseDescription.append('<li>Ravage: <span class="badge" id="phase-list-ravage-badge"> </span> </li>')
        invaderPhaseDescription.append('<li>Build: <span class="badge" id="phase-list-build-badge"> </span> </li>')
        if (invaderSeq[turn][0] === 2 && invaderSeq[turn][1] != 'c') {
            invaderPhaseDescription.append('<li>Explore: <span class="badge" id="phase-list-explore-badge"> </span> + Escalation</li>')
        }
        else {
            invaderPhaseDescription.append('<li>Explore: <span class="badge" id="phase-list-explore-badge"> </span> </li>')
        }

        invaderPhaseDescription.appendTo(listItem);
    }
    else if (phaseIndex === 6) {

        phaseListIconContainer.prepend($('<img src="./assets/symbol/slow.png">')
            .addClass('phase-list-icon brightness'));

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

    return listItem;
}

// Function attached to setup modal 'Start Game' button
function setup() {

    localStorage.clear();

    // Testing with Prussia 6. Delete before release. 
    playerCount = $('input[name="playerCount"]:checked').val();
    adversary = $('input[name="adversary"]:checked').val();
    adversaryLevel = $('#adversaryLevel').val() || 0;

    // England 6 special rule
    if (adversary === 'england' && adversaryLevel === '6') {
        maxFear = playerCount * 5;
        // Need another line to update invader card area text
    } else {
        maxFear = playerCount * 4;
    }

    if (adversary !== 'none') {
        invaderLevelSeq = adversaryConfig[adversary]['invader'][adversaryLevel];
        fearLevelSeq = adversaryConfig[adversary]['fear'][adversaryLevel];
    }
    else { // No adversary
        invaderLevelSeq = [1,1,1,2,2,2,2,3,3,3,3,3];
        fearLevelSeq = [3,3,3];
    }

    // Sweden 4: discard top card of lowest invader stage remaining
    if (adversary === 'sweden' && adversaryLevel >= 4) {
        for (let i = 0; i < invaderSeq.length; i++) {
            if (invaderSeq[i][1] === Math.min(levelSeq)) {
                invaderSeq.splice(i, 1);
                return;
            }
        }
    }

    fear = 0;

    // Fall back to lower level if undefined (same as level below)
    for (let i = adversaryLevel; invaderLevelSeq.length === 0 || i === 0; i--) {
        invaderLevelSeq = adversaryConfig[adversary].invader[i];
        if (i === 0) invaderLevelSeq = [1,1,1,2,2,2,2,3,3,3,3,3]; // Default sequence
    }
    for (let i = adversaryLevel; fearLevelSeq.length === 0 || i === 0; i--) {
        fearLevelSeq = adversaryConfig[adversary].fear[i];
        if (i === 0) fearLevelSeq = [3,3,3]; // Default sequence
    }

    fearSeq = generateSeq(50);
    eventSeq = generateSeq(62);
    // France 2 special rule (Slave Rebellion is event/1.jpg)
    for (let i = 0; i < eventSeq.length; i++) {
        if (eventSeq[i] === 1) {
            if (adversary === 'france' && adversaryLevel >= 2) {
                eventSeq[i] = eventSeq[3];
                eventSeq[3] = 1; 
            }
            else {
                // Remove event card 1 if not using Slave Rebellion
                eventSeq.splice(i, 1);
            }
        }
    }
    
    generateInvaderSeq(invaderLevelSeq);
    invaderCards = [[],[],[],[invaderSeq[0]]];

    phase = 5;
    updateUI();

}

function save() {
    const gameData = {
        playerCount: playerCount,
        adversary: adversary,
        adversaryLevel: adversaryLevel,
        invaderSeq: invaderSeq,
        invaderSeqIndex: invaderSeqIndex,
        invaderLevelSeq: invaderLevelSeq,
        fear: fear,
        fearSeq: fearSeq,
        fearSeqIndex: fearSeqIndex,
        eventSeq: eventSeq,
        eventSeqIndex: eventSeqIndex,
        turn: turn,
        turnRandomNumber: turnRandomNumber,
        phase: phase,
        fear: fear,
        maxFear: maxFear,
        earnedFearCards: earnedFearCards,
        fearLevelSeq: fearLevelSeq,
        terrorLevel: terrorLevel,
        cardDisplayHTML: cardDisplay.html(),
        invaderCards: invaderCards,
        cardHistoryEventIndex: cardHistoryEventIndex,
        cardHistoryFearIndex: cardHistoryFearIndex,
        fracturedDaysPeekedType: fracturedDaysPeekedType
    };
    
    localStorage.setItem(`${saveIndex}`, JSON.stringify(gameData));
    saveIndex++;
    console.log('Game data saved:', saveIndex, gameData);
}

function load(index) {
    // console.log('Loading savegame ', saveIndex);

    let gameData = JSON.parse(localStorage.getItem(`${index}`));

    playerCount = gameData.playerCount;
    adversary = gameData.adversary;
    adversaryLevel = gameData.adversaryLevel;
    
    invaderSeq = gameData.invaderSeq;
    invaderSeqIndex = gameData.invaderSeqIndex;
    invaderLevelSeq = gameData.invaderLevelSeq;
    fearSeq = gameData.fearSeq;
    fearSeqIndex = gameData.fearSeqIndex;
    eventSeq = gameData.eventSeq;
    eventSeqIndex = gameData.eventSeqIndex;
    
    turn = gameData.turn;
    turnRandomNumber = gameData.turnRandomNumber;
    phase = gameData.phase;

    fear = gameData.fear;
    maxFear = gameData.maxFear;
    earnedFearCards = gameData.earnedFearCards;

    fearLevelSeq = gameData.fearLevelSeq;
    terrorLevel = gameData.terrorLevel;

    cardDisplay.html(gameData.cardDisplayHTML);

    invaderCards = gameData.invaderCards;

    cardHistoryEventIndex = gameData.cardHistoryEventIndex;
    cardHistoryFearIndex = gameData.cardHistoryFearIndex;

    fracturedDaysPeekedType = gameData.fracturedDaysPeekedType;

    updateUI();

    console.log('Game data loaded:', saveIndex, gameData);
}

function undo() {
    saveIndex--;
    load(saveIndex-1);
}

function updateUI() {
    updateTerrorLevel();
    updateFearBadge();
    updateInvaderCard();

    fearProgressBar.attr('style', 'width: ' + fear / maxFear * 100 + '%');
    fearProgressBar.html(fear + ' / ' + maxFear);

    // If in invader phase, show explore. 
    if (phase === 5) {updateInvaderBadge(true)} else {updateInvaderBadge(false)}
    
    $('#total-turn-count-display').html(invaderLevelSeq.length);
    
    $('#invader-level-sequence').html(invaderLevelSeq.slice(invaderSeqIndex-1).join(' '));

    $('#player-count-display').html(playerCount);
    if (adversary !== 'none') {
        $('#adversary-name-display').html(adversaryNameDict[adversary] + ' ' + adversaryLevel);
    } else {
        // No adversary, hide button
        $('#adversary-name-display').html('None');
        $('#show-adversary-card-btn').hide();
    }

    // Clear main display if moving away from draw card phase
    let clearDisplayPhases = [0, 1, 2, 5, 6, 7];
    if (clearDisplayPhases.includes(phase)) {
        if (adversary === 'none') {
            clearCardDisplay();
        } else {
            displayCard('adversary', adversary);
        }
    }
    
    let redrawEnabledPhases = [3,4];
    if (redrawEnabledPhases.includes(phase)) {
        $('#redraw-btn').removeAttr('disabled');
    } else {
        $('#redraw-btn').attr('disabled','');
    }

    $('#last-event-card-btn').attr('disabled','');
    $('#next-event-card-btn').attr('disabled','');
    $('#last-fear-card-btn').attr('disabled','');
    $('#next-fear-card-btn').attr('disabled','');
    if (eventSeqIndex > 0) $('#this-event-card-btn').removeAttr('disabled');
    if (fearSeqIndex > 0) $('#this-fear-card-btn').removeAttr('disabled');  

}

function startNewGame() {
    if (confirm('Start a new game? This will erase your current game.')) {
        localStorage.clear();
        location.reload();
    }
}

function showAdversaryCard() {
    if (adversary === 'none') clearCardDisplay();
    displayCard('adversary', adversary);
}

function clearCardDisplay() {
    cardDisplay.empty();
}

function showExploreCard() {
    invaderCards[3] = [];
    nextCard = invaderSeq[turn];
    invaderCards[3].push(invaderSeq[turn]);
    updateInvaderCard();
}

function advanceInvaderCard() {
    for (let i = 0; i < 3; i++) {
        invaderCards[i] = invaderCards[i+1];
    }
    invaderCards[3] = [];
    nextCard = invaderSeq[invaderSeqIndex+1];
    if (!isNaN(nextCard[0])) {
        invaderCards[3].push(invaderSeq[turn][0]);
    } else {
        invaderCards[3].push(invaderSeq[turn]);
    }
    invaderSeqIndex++;
    updateInvaderCard();
}

function generateInvaderCard(code) {
    let img = $('<img>').addClass('game-card game-card-invader');
    img.attr('src', `./assets/invader/${code}.jpg`);
    return img;
}

function updateInvaderCard() {
    let slots = [invaderCardFourth, invaderCardRavage, invaderCardBuild, invaderCardExplore];
    for (let i = 0; i < 4; i++) {
        slots[i].empty();
        if (!invaderCards[i]) continue;
        for (let j = 0; j < invaderCards[i].length; j++) {
            slots[i].append(generateInvaderCard(invaderCards[i][j]))
        }
    }
}

function generateInvaderSeq(levelSeq) {

    // levelSeq: defined in adversary-config under each 'invader' section

    let level1 = ['1w', '1s', '1j', '1m'];
    let level2 = ['2w', '2s', '2j', '2m', '2c'];
    let level3 = ['3js', '3jw', '3mj', '3mw', '3sm', '3sw'];

    invaderSeq = Array(levelSeq.length);
    let index = 0;

    for (let i = 0; i < levelSeq.length; i++) {
        if (isNaN(levelSeq[i])) {
            // If not a number, it is a specified invader card code. 
            // Prioritise its position in invader card sequence.
            invaderSeq[i] = levelSeq[i];
        }
    }

    for (let i = 0; i < levelSeq.length; i++) {
        level = levelSeq[i];
        if (invaderSeq[i] !== undefined) continue; // Pre-filled slot
        if (level === 1) {
            index = Math.floor(Math.random() * level1.length);
            invaderSeq[i] = (level1[index]);
            level1.splice(index, 1);
        } 
        else if (level === 2) {
            index = Math.floor(Math.random() * level2.length);
            invaderSeq[i] = (level2[index]);
            level2.splice(index, 1);
        }
        else if (level === 3) {
            index = Math.floor(Math.random() * level3.length);
            invaderSeq[i] = (level3[index]);
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
    b.addClass('badge invader-badge');
    
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
            b.css('background-color', '#7eebde');
            b.css('color','#000');
            b.html('Wetland');
            break;
        case 'c': 
            b.css('background-color', '#0483f1');
            b.css('color','#ffffff');
            b.html('Coastal Lands');
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

    ravageBadge = $('#phase-list-ravage-badge');
    buildBadge = $('#phase-list-build-badge');
    exploreBadge = $('#phase-list-explore-badge');

    ravageBadge.empty();
    buildBadge.empty();
    exploreBadge.empty();

    badges = [exploreBadge, buildBadge, ravageBadge];

    // Invader level of generated badge. Generate two badges if level 3. 
    let level = 0;

    for (let i = 0; i < 3; i++) {

        // Update badges from explore to ravage

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
            // Add '+ Escalation' if level 2 Explore (i=0) card flipped and not Coastal Lands
            if (level === 2 && i === 0 && invaderSeq[turn - i][1] !== 'c') {
                badges[i].append(' + Escalation')
            }   
        }
        else if (level === 3) {
            badges[i].append(generateBadge(invaderSeq[turn - i][1]), generateBadge(invaderSeq[turn - i][2]));
        }
        
    }
    
}

function displayCardHistory(type,step) {
    let lastEventBtn = $('#last-event-card-btn');
    let nextEventBtn = $('#next-event-card-btn');
    let lastFearBtn = $('#last-fear-card-btn');
    let nextFearBtn = $('#next-fear-card-btn');

    if (step === 0) {
        switch (type){
        case 'event': 
            cardHistoryEventIndex = eventSeqIndex-1;
            displayCard('event', eventSeq[eventSeqIndex-1]);
            if (cardHistoryEventIndex <= 0) lastEventBtn.attr('disabled',''); else lastEventBtn.removeAttr('disabled');
            nextEventBtn.attr('disabled','');
            return;
        case 'fear': 
            cardHistoryFearIndex = fearSeqIndex-1;
            displayCard('fear', fearSeq[fearSeqIndex-1]);
            if (cardHistoryFearIndex <= 0) lastFearBtn.attr('disabled',''); else lastFearBtn.removeAttr('disabled');
            nextFearBtn.attr('disabled','');
            return;
        }
    }
    switch (type){
        case 'event': 
            cardHistoryEventIndex += step;
            if (cardHistoryEventIndex < eventSeqIndex-1) {
                nextEventBtn.removeAttr('disabled');
            } else {
                cardHistoryEventIndex = eventSeqIndex-1;
                nextEventBtn.attr('disabled','');
            }
            if (cardHistoryEventIndex > 0) {
                lastEventBtn.removeAttr('disabled')
            } else {
                cardHistoryEventIndex = 0;
                lastEventBtn.attr('disabled','')
            }
            displayCard('event', eventSeq[cardHistoryEventIndex]);
            break;
        case 'fear': 
            cardHistoryFearIndex += step;
            if (cardHistoryFearIndex < fearSeqIndex-1) {
                nextFearBtn.removeAttr('disabled');
            } else {
                cardHistoryFearIndex = fearSeqIndex-1;
                nextFearBtn.attr('disabled','');
            }
            if (cardHistoryFearIndex > 0) {
                lastFearBtn.removeAttr('disabled')
            } else {
                cardHistoryFearIndex = 0;
                lastFearBtn.attr('disabled','')
            }
            displayCard('fear', fearSeq[cardHistoryFearIndex]);
            break;
    }
}

function validateSetupForm() {
    let playerCount = $('input[name="playerCount"]:checked').val();
    let adversary = $('input[name="adversary"]:checked').val();
    
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

function slaveRebellion(type) {
    // 0: return card to under top 3 cards of event deck; draw new event card
    // 1: discard slave rebellion card; draw new event card
    if (type === 0) {
        if (eventSeqIndex > eventSeq.length - 4) {
            // Regenerate event card sequence if left over deck not big enough
            // Highly unlikely to happen but not impossible
            eventSeq = generateSeq(eventSeq.length);
            eventSeqIndex = 0;
        }

        drawCard('event');
        eventSeq.splice(eventSeqIndex+3, 0, 1);
        
        alert(`A new Event Card is now drawn and displayed. Slave Rebellion has been returned to the Event Deck under the top 3 cards. `)
    }
    else if (type === 1) {
        drawCard('event');
        alert(`A new Event Card is now drawn and displayed. Slave Rebellion has been discarded. `)
    }
}

function fracturedDaysPower(deck, strength) { 

    if (![1,6].includes(phase)) {
        alert('You can only use these powers during the Fast Power or Slow Power phase. ');
        return;
    }

    // Deck: 0 is invader; 1 is event
    // Strength: 0 is weak, 1 is strong

    if (strength === 9) {
        // Return specified card to bottom of respective deck. 

        if (deck === 0) {
            // Does not work. Need fixing
            invaderSeqFirst = invaderSeq.shift();
            invaderSeq.push(invaderSeqFirst);
            updateInvaderCard();
            alert('The top Invader Card has been moved to the bottom of the deck. ')
        }
        else if (deck === 1) {
            eventSeqFirst = eventSeq.shift();
            eventSeq.push(eventSeqFirst);
            alert('The top Event Card has been moved to the bottom of the deck. ')
        }

        return;
    }


    if (deck === 0) {

        let stage = 0;
        let invaderCode = '';

        if (strength === 0) {
            invaderCode = (turnRandomNumber >= 0.5 ? invaderSeq[turn] : invaderSeq[turn+1]);
            stage = invaderCode[0];
            if (isNaN(stage)) {
                stage = 0;
                terrain = invaderCode;
                alert(`The top card of the Invader Deck is a ${invaderCardDict[terrain]} card. You shuffle it with the second card of the deck. \nIf you want to see the card again later, please press the same button.`);
            } else {
                terrain = invaderCode[1];
                alert(`The top card of the Invader Deck is a Stage ${stage} ${invaderCardDict[terrain]} card. You shuffle it with the second card of the deck. \nIf you want to see the card again later, please press the same button.`);
            }
            
        } else if (strength === 1) {
            invaderCode = invaderSeq[turn];
            stage = invaderCode[0];
            if (isNaN(stage)) {
                stage = 0;
                terrain = invaderCode;
                alert(`The top card of the Invader Deck is a ${invaderCardDict[terrain]} card. \nNo further actions are needed if you want to return it to the top of the deck. \nUse the buttons on the third row to return it to the bottom of the deck.  `);
            } else {
                terrain = invaderCode[1];
                alert(`The top card of the Invader Deck is a Stage ${stage} ${invaderCardDict[terrain]} card. \n No further actions are needed if you want to return it to the top of the deck. \nUse the buttons on the third row to return it to the bottom of the deck.  `);
            }
            
        }
    }
    if (deck === 1) {
        let img = document.createElement('img');
        img.classList.add('game-card');

        if (strength === 0) {
            card = (turnRandomNumber >= 0.5 ? eventSeq[eventSeqIndex] : eventSeq[eventSeqIndex+1]);
            img.src = (`./assets/event/${card}.jpg`)
            alert(`The top card of the Event Deck is now displayed. You shuffle it with the second card of the deck. \nIf you want to see the card again later, please press the same button.`);
        } else if (strength === 1) {
            card = eventSeq[eventSeqIndex];
            img.src = (`./assets/event/${card}.jpg`)
            alert(`The top card of the Event Deck is now displayed. \nNo further actions are needed if you want to return it to the top of the deck. \nUse the buttons on the third row to return it to the bottom of the deck.`);
        }

        clearCardDisplay();
        cardDisplay.append(img);
    }
}

function existInPhaseList(i) {

    // Need to rewrite if phase list organisation changes later

    if (phase >= 1 && phase <= phaseCount - phaseListDisplayLength + 1) {
        // If phase list does not involve wrapping around
        return (i >= 0 && i <= phaseCount - phaseListDisplayLength + 1);
    }
    else {
        if (phase === 0) return (i === phaseCount - 1 || i < phaseListDisplayLength - 2);
        else return (i >= phaseCount - 2 || i <= phaseListDisplayLength - 3);
    }
}