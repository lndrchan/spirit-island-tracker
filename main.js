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
var blightEnabled = true;

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

var level1 = ['1w', '1s', '1j', '1m'];
var level2 = ['2w', '2s', '2j', '2m', '2c'];
var level3 = ['3js', '3jw', '3mj', '3mw', '3sm', '3sw'];

var fearProgressBar = null;
var leftBarFearBadge = null;
var phaseListFearBadge = null;
var leftBarFearCardBadges = null;
var leftBarFearCardsNextLevel = null;
var fear = 0;
var earnedFearCards = 0;
var maxFear = 0;
var fearLevelSeq = [];
var fearLevelSeqCustom = [];
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
var invaderLevelSeqCustom = [];

var turn = 0;
var turnRandomNumber = 0;

var blightSeq = Array(BLIGHT_CARD_COUNT);
var blightSeqIndex = 0;
var blightFlipped = false;

var BLIGHT_CARD_COUNT = 23;
var FEAR_CARD_COUNT = 50;
var EVENT_CARD_COUNT = 62;

var fearSeq = Array(FEAR_CARD_COUNT);
var fearSeqIndex = 0;
var eventSeq = Array(EVENT_CARD_COUNT);
var eventSeqIndex = 0;

var saveIndex = 0;

var cardHistoryEventIndex;
var cardHistoryFearIndex;
var lastEventBtn;
var nextEventBtn;
var lastFearBtn;
var nextFearBtn;

var cardDisplayType = ''; // 'fear', 'event', 'blight', 'adversary', ''
var cardDisplayContent = ''; // id of card being displayed


// Special action-specific variables

var fracturedDaysPeekedType = 0; // 0 (invader) or 1 (event)

// Initialisations
$(function() {

    invaderCardExplore = $('#invader-card-explore');
    invaderCardBuild = $('#invader-card-build');
    invaderCardRavage = $('#invader-card-ravage');
    invaderCardFourth = $('#invader-card-fourth');

    lastEventBtn = $('#last-event-card-btn');
    nextEventBtn = $('#next-event-card-btn');
    lastFearBtn = $('#last-fear-card-btn');
    nextFearBtn = $('#next-fear-card-btn');

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

    $('#customSequencesEnabled').on('change', function() {
        if ($(this).is(':checked')) {
            $('#customSequencesSection').slideDown();
        } else {
            $('#customSequencesSection').slideUp();
        }
    });

    $('#startGameBtn').on('click', function() {
        if (validateSetupForm() && processCustomSequences()) {
            setup();
            setupModal.modal('hide');
            setupModal.css('display','none');
        }
    });

    $(document).on('keydown', function(e) {
        // Skip if typing in input fields
        if ($(e.target).is('input, textarea, select')) {
            return;
        }
        
        // Skip if modal is open
        if ($('.modal.show').length > 0) {
            return;
        }
        
        // Enter or Space - Next phase
        if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
            e.preventDefault();
            
            // Add visual feedback
            const $btn = $('#btn-next-phase');
            $btn.addClass('active');
            
            // Trigger click
            $btn.click();
            
            // Remove active class after animation
            setTimeout(() => {
                $btn.removeClass('active');
            }, 200);
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
        turnRandomNumber = Math.random();
        updateUI();
        save();
        return;
    }

    if (phase === 3 && eventEnabled && eventSeq[eventSeqIndex-1] == 1) {
        slaveRebellion();
        return;
    }

    // Check before phase advance: if at fear card phase and still has unresolved fear card, 
    // do not advance phase
    if (phase === 4 && earnedFearCards > 0) {
        drawCard('fear');
        earnedFearCards--;
        updateUI();
        save();
        return;
    }

    advancePhaseList(1);

    if (phase === 0) {
        turn++;
        turnRandomNumber = Math.random();
        $('#turn-count-display').html(turn);
        $('#total-turn-count-display').html(invaderSeq.length);
    }

    if (phase === 2) {
        clearCardDisplay();
        if (!blightEnabled) {
            cardDisplay.html(`
                <div class="preview-placeholder cantora-one">
                    <i class="text-muted">Blight Card Disabled</i>
                </div>
            `);
        } else {
            if (!blightFlipped) {
                displayCard('blight', 'back');
            } else {
                displayCard('blight', blightSeq[blightSeqIndex]);
            }
        }
    }

    if (phase === 3) {
        clearCardDisplay();
        if (eventEnabled) {
            drawCard('event');
        } else {
            displayCard('', `
                <div class="preview-placeholder cantora-one">
                    <i class="text-muted">Event Cards Disabled</i>
                </div>
            `)
        }   
    }

    if (phase === 4) {
        clearCardDisplay();
        if (earnedFearCards === 0) {
            displayCard('', `
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
        updateInvaderCard(true);
        updateInvaderBadge(true);
        clearCardDisplay();
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

    updateUI();
    save();
}


function updateTerrorLevel() {
    if (terrorLevel >= 3) {
        alert('Fear Victory! No more Fear Cards left. ');
        return;
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

    if (adversary === 'russia' && adversaryLevel >= 5) {
        let russiaFearCount = 0;
        for (let i = 0; i < 3; i++) {
            russiaFearCount += adversaryConfig[adversary]['fear'][adversaryLevel][i] - fearLevelSeq[i];
            console.log(adversaryConfig[adversary]['fear'][adversaryLevel][i], fearLevelSeq[i]);
        }

        if (russiaFearCount === 3) {
            alert('Russia effect triggered: Entrench in the Face of Fear');
            let unusedLevel2 = level2.filter(function(item) {return !invaderSeq.includes(item)});
            invaderCards[2].push(unusedLevel2[Math.floor(Math.random() * unusedLevel2.length)]);
            updateInvaderCard(false);
            updateInvaderBadge();
        }
        if (russiaFearCount === 7) {
            alert('Russia effect triggered: Entrench in the Face of Fear');
            let unusedLevel3 = level3.filter(function(item) {return !invaderSeq.includes(item)});
            invaderCards[2].push(unusedLevel3[Math.floor(Math.random() * unusedLevel3.length)]);
            updateInvaderCard(false);
            updateInvaderBadge();
        }
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
            if (eventSeq[eventSeqIndex] === 1) {
                // SLAVE REBELLION ALERTS
                if (invaderLevelSeq[invaderSeqIndex] < 3) {
                    alert(`Slave Rebellion has been drawn. Since the invader level is ${invaderLevelSeq[invaderSeqIndex]}, 'Small Uprising' will be triggered. `);
                } else {
                    alert(`Slave Rebellion has been drawn again. Since the invader level is ${invaderLevelSeq[invaderSeqIndex]}, 'Rebellion' will be triggered. `);
                }
            }
            eventSeqIndex++;
            if (eventSeqIndex >= eventSeq.length) {
                eventSeq = generateSeq(eventSeq.length);
                eventSeqIndex = 0;
            }
            break;
    }
}

function displayCard(type, content) {

    cardDisplayType = type;
    cardDisplayContent = content;

    const $cardDisplay = $('#main-card-display');
    
    // Fade out container
    $cardDisplay.fadeOut(300, function() {
        // Clear and add new image
        $cardDisplay.empty();
        
        if (type === '') {
            $cardDisplay.html(content);
            $cardDisplay.fadeIn(300);
            return;
        }
        const $img = $('<img>')
            .addClass('game-card')
            .attr('src', `./assets/${type}/${content}.jpg`);
        
        if (type === 'adversary') {
            $img.addClass('game-card-h');
        }
        
        // Add image and fade container back in
        $cardDisplay.append($img).fadeIn(300, function() {
            // Remove inline styles after fade completes
            $cardDisplay.css({
                'opacity': '',
                'display': ''
            });
            $img.css({
                'opacity': '',
                'display': ''
            });
        });
    });
}

function clearCardDisplay() {
    cardDisplay.empty();
}

function redraw() {
    if (phase === 2) {
        if (blightSeqIndex >= blightSeq.length-1) blightSeq = generateSeq(BLIGHT_CARD_COUNT);
        blightSeq[blightSeqIndex] = blightSeq.pop();
        displayCard('blight', blightSeq[blightSeqIndex]);
    }
    else if (phase === 3) {
        // Event card phase
        if (eventSeqIndex >= eventSeq.length-1) eventSeq = generateSeq(EVENT_CARD_COUNT);
        eventSeq[eventSeqIndex-1] = eventSeq.pop();
        displayCard('event', eventSeq[eventSeqIndex-1]);
    }
    else if (phase === 4) {
        // Fear card phase
        if (fearSeqIndex >= fearSeq.length-1) fearSeq = generateSeq(FEAR_CARD_COUNT);
        fearSeq[fearSeqIndex-1] = fearSeq.pop();
        displayCard('fear', fearSeq[fearSeqIndex-1]);
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

function updatePhaseList() {
    
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
    if (phaseIndex === phase - 1 || (phase === 0 && phaseIndex === phaseCount - 1)) {
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

        if (earnedFearCards > 0) {
            $('<span></span>')
                .addClass('badge text-bg-dark fear-badge')
                .attr('id', 'phase-list-fear-badge')
                .css('float', 'right')
                .html(earnedFearCards)
                .appendTo(listItem);
        }
    }
    else if (phaseIndex === 5) {
        // Invader phase texts

        phaseListIconContainer.prepend($('<img src="./assets/symbol/explorer.png">')
            .addClass('phase-list-icon inverted'));

        listItem.removeClass('d-flex');
        let invaderPhaseDescription = $('<ul style="list-style-type:none; padding-left: 40px;margin-top: 0.5em;margin-bottom: 0em;"></ul>');
        invaderPhaseDescription.append('<li id="phase-list-fourth-item" style="display:none;">Build: <span class="badge" id="phase-list-fourth-badge"> </span> </li>')
        invaderPhaseDescription.append('<li>Ravage: <span class="badge" id="phase-list-ravage-badge"> </span> </li>')
        invaderPhaseDescription.append('<li>Build: <span class="badge" id="phase-list-build-badge"> </span> </li>')
        invaderPhaseDescription.append('<li>Explore: <span class="badge" id="phase-list-explore-badge"> </span> </li>')

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

    if (phaseIndex === phase) {
        heading.after('<span style="float: right;" class="badge rounded-pill bg-primary" id="current-badge"> <i>Current</i> </span>')
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

    eventEnabled = $('#eventCardsEnabled').is(':checked');
    blightEnabled = $('#blightCardsEnabled').is(':checked');

    // England 6 special rule
    if (adversary === 'england' && adversaryLevel === '6') {
        maxFear = playerCount * 5;
        // Need another line to update invader card area text
    } else {
        maxFear = playerCount * 4;
    }

    if (adversary !== 'none') {
        invaderLevelSeq = adversaryConfig[adversary]['invader'][adversaryLevel].slice();
        fearLevelSeq = adversaryConfig[adversary]['fear'][adversaryLevel].slice();
    }
    else { // No adversary
        invaderLevelSeq = [1,1,1,2,2,2,2,3,3,3,3,3];
        fearLevelSeq = [3,3,3];
    }

    if (invaderLevelSeqCustom.length > 0) {
        invaderLevelSeq = invaderLevelSeqCustom;
    }
    if (fearLevelSeqCustom.length > 0) {
        fearLevelSeq = fearLevelSeqCustom;
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

    blightSeq = generateSeq(BLIGHT_CARD_COUNT);
    fearSeq = generateSeq(FEAR_CARD_COUNT);
    eventSeq = generateSeq(EVENT_CARD_COUNT);

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

    // Start at Turn 0 Invader phase
    phase = 5;
    
    initUI();
    showAdversaryCard();
    updatePhaseList();
    updateUI();
    updateInvaderCard(true);

    save();
}

function save() {
    const gameData = {
        playerCount: playerCount,
        adversary: adversary,
        adversaryLevel: adversaryLevel,
        blightSeq: blightSeq,
        blightSeqIndex: blightSeqIndex,
        blightFlipped: blightFlipped,
        invaderSeq: invaderSeq,
        invaderSeqIndex: invaderSeqIndex,
        invaderLevelSeq: invaderLevelSeq,
        invaderLevelSeqCustom: invaderLevelSeqCustom,
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
        cardDisplayContentType: cardDisplayType,
        cardDisplayContent: cardDisplayContent,
        invaderCards: invaderCards,
        cardHistoryEventIndex: cardHistoryEventIndex,
        cardHistoryFearIndex: cardHistoryFearIndex,
        fracturedDaysPeekedType: fracturedDaysPeekedType
    };
    
    localStorage.setItem(`${saveIndex}`, JSON.stringify(gameData));
    console.log('Game data saved:', saveIndex, gameData);
    saveIndex++;
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
    invaderLevelSeqCustom = gameData.invaderSeqCustom;

    blightSeq = gameData.blightSeq;
    blightSeqIndex = gameData.blightSeqIndex;
    blightFlipped = gameData.blightFlipped;

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

    invaderCards = gameData.invaderCards;

    cardHistoryEventIndex = gameData.cardHistoryEventIndex;
    cardHistoryFearIndex = gameData.cardHistoryFearIndex;
    cardDisplayType = gameData.cardDisplayContentType;
    cardDisplayContent = gameData.cardDisplayContent;

    fracturedDaysPeekedType = gameData.fracturedDaysPeekedType;

    initUI();
    updatePhaseList();
    displayCard(gameData.cardDisplayContentType, gameData.cardDisplayContent);
    updateUI();
    if (phase === 5) { updateInvaderCard(true); } else { updateInvaderCard(false); }
    setupModal.modal('hide');
    setupModal.css('display','none');

    console.log('Game data loaded:', saveIndex, gameData);
}

function undo() {
    if (saveIndex <= 1) return; 
    saveIndex--;
    load(saveIndex-1);
}

function updateUI() {
    updateTerrorLevel();
    updateFearBadge();
    updateInvaderBadge();

    fearProgressBar.attr('style', 'width: ' + fear / maxFear * 100 + '%');
    fearProgressBar.html(fear + ' / ' + maxFear);

    // If in invader phase, show explore. 
    if (phase === 5) {updateInvaderBadge(true)} else {updateInvaderBadge(false)}
    
    invaderLevelSeq = invaderSeq.map(code => codeToLevel(code));  

    $('#turn-count-display').html(invaderSeqIndex);
    $('#invader-level-sequence').html(invaderLevelSeq.slice(invaderSeqIndex).join(' '));

    // MUST RUN THIS AFTER UPDATING INVADER LEVEL SEQUENCE UI
    for (let i = 0; i < 4; i++) {
        if (codeToLevel(invaderLevelSeq[i]) >= 3) invaderLevelSeq[i] = 2; // Prussia: early stage 3 treated as stage 2
    }

    if (adversary === 'england') {
        // Remove high immigration tile if level is 3
        if (adversaryLevel === 3) {
            let invaderSeqIndexGreaterThanLevel1 = 0;
            for (let i = 0; i < invaderLevelSeq.length; i++) {
                if (invaderLevelSeq[invaderSeqIndexGreaterThanLevel1] > 1) break;
                invaderSeqIndexGreaterThanLevel1 ++;
            }
            if (invaderSeqIndex < invaderSeqIndexGreaterThanLevel1 + 3) {
                if ($('#phase-list-fourth-item')) $('#phase-list-fourth-item').css('display','block'); 
                $('#invader-card-label-fourth').html('Build 🏴󠁧󠁢󠁥󠁮󠁧󠁿')
            } else {
                if ($('#phase-list-fourth-item')) $('#phase-list-fourth-item').css('display','none'); 
                $('#invader-card-label-fourth').html('Discard')
            }
        }
        else if (adversaryLevel >= 4) {
            if ($('#phase-list-fourth-item')) $('#phase-list-fourth-item').css('display','block'); 
            $('#invader-card-label-fourth').html('Build 🏴󠁧󠁢󠁥󠁮󠁧󠁿')
        }
        
    }
    
    let redrawEnabledPhases = [3,4];
    if (redrawEnabledPhases.includes(phase)) {
        $('#redraw-btn').removeAttr('disabled');
    } else {
        $('#redraw-btn').attr('disabled','');
    }

    let fearBtnDisabledPhases = [4];
    if (fearBtnDisabledPhases.includes(phase)) {
        $('.fear-btn').attr('disabled','');
    } else {
        $('.fear-btn').removeAttr('disabled');
    }

    if (saveIndex == 0) {
        $('#btn-undo').attr('disabled','');
    } else {
        $('#btn-undo').removeAttr('disabled');
    }

    if (cardHistoryEventIndex > 0 && eventEnabled) {
        $('#this-event-card-btn').removeAttr('disabled');
    } else {
        $('#this-event-card-btn').attr('disabled','');
    }
    if (cardHistoryFearIndex > 0) {
        $('#this-fear-card-btn').removeAttr('disabled');  
    } else {
        $('#this-fear-card-btn').attr('disabled','');
    }

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
        

}

function initUI() {

    if (!blightEnabled) {
        $('#show-blight-card-btn').css('display','none');
        $('#blight-btn').css('display','none');
    }

    $('#total-turn-count-display').html(invaderSeq.length);
    let invaderCardLabels = [
        $('#invader-card-label-fourth'), 
        $('#invader-card-label-ravage'), 
        $('#invader-card-label-build'), 
        $('#invader-card-label-explore')
    ];

    $('#invader-card-label-ravage').html('Ravage');
    $('#invader-card-label-build').html('Build');
    $('#invader-card-label-explore').html('Explore');

    if (adversary !== 'none') {
        $('#adversary-name-display').html(adversaryNameDict[adversary] + ' ' + adversaryLevel);

        let actionChangeIndex = adversaryConfig[adversary]['actionChange'][adversaryLevel];
        for (let i = 0; i < actionChangeIndex.length; i++) {
            invaderCardLabels[actionChangeIndex[i]].append(' ' +adversaryFlagDict[adversary]);
        }
    } else {
        // No adversary, hide button
        $('#adversary-name-display').html('None');
        $('#show-adversary-card-btn').hide();
    }
}

function startNewGame() {
    if (confirm('Start a new game? This will erase your current game.')) {
        localStorage.clear();
        location.reload();
    }
}

function showAdversaryCard() {
    if (adversary === 'none') return;
    displayCard('adversary', adversary);
}

function showBlightCard() {
    if (!blightEnabled) return;
    if (!blightFlipped) {
        displayCard('blight', 'back');
        return;
    }
    displayCard('blight', blightSeq[blightSeqIndex]);
}

function advanceInvaderCard() {
    for (let i = 0; i < 3; i++) {
        let newArray = [];

        for (let j = 0; j < invaderCards[i+1].length; j++) {
            if (i === 0 && invaderCards[i+1][j] === 'ss') continue;
            if (i === 1 && invaderCards[i][j] === 'ss') {
                newArray.push('ss');
            }
            newArray.push(invaderCards[i+1][j]);
        }

        invaderCards[i] = newArray;
    }

    invaderSeqIndex++;
    if (invaderSeqIndex === invaderSeq.length) {
        alert('This is the last turn before time runs out...')
    }
    if (invaderSeqIndex > invaderSeq.length) {
        alert('You have reached the end of the Invader Deck. The Invaders have taken over the Island...')
        return;
    }

    updateInvaderCard(false);
}

function generateInvaderCard(code) {
    let img = $('<img>').addClass('game-card game-card-invader');
    img.attr('src', `./assets/invader/${code}.jpg`);
    return img;
}

function updateInvaderCard(showExploreCard) {
    let slots = [invaderCardFourth, invaderCardRavage, invaderCardBuild, invaderCardExplore];

    nextCard = invaderSeq[invaderSeqIndex];
    
    invaderCards[3] = [];
    if (nextCard) {
        if (!isNaN(nextCard[0])) {
            if (showExploreCard) {
                invaderCards[3].push(nextCard);
            } else {
                invaderCards[3].push(codeToLevel(nextCard));
            }
        } else {
            invaderCards[3].push(nextCard);
        }
    }

    for (let i = 0; i < 4; i++) {
        slots[i].empty();
        if (!invaderCards[i]) continue; // Skip slot if no cards in invaderCards[i]
        for (let j = 0; j < invaderCards[i].length; j++) {
            slots[i].append(generateInvaderCard(invaderCards[i][j]))
        }
    }
}

function generateInvaderSeq(levelSeq) {

    // levelSeq: defined in adversary-config under each 'invader' section

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
        level = parseInt(levelSeq[i]);
        if (invaderSeq[i] !== undefined) continue; // Pre-filled slot
        if (level == 1) {
            index = Math.floor(Math.random() * level1.length);
            invaderSeq[i] = (level1[index]);
            level1.splice(index, 1);
        } 
        else if (level == 2) {
            index = Math.floor(Math.random() * level2.length);
            invaderSeq[i] = (level2[index]);
            level2.splice(index, 1);
        }
        else if (level == 3) {
            index = Math.floor(Math.random() * level3.length);
            invaderSeq[i] = (level3[index]);
            level3.splice(index, 1);
        }
    }

}

function generateSeq(n) {
    let output = Array(n);
    let orderedArray = Array.from({length: n}, (_, i) => i);

    for (let i = 0; i < n; i++) {
        let random = Math.floor(Math.random() * (n-i));
        output[i] = orderedArray[random]+1;
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
        case 'ss': 
            b.css('background-color', '#ffffff');
            b.css('border-color', '#767167');
            b.css('color','#767167');
            b.html('Salt');
            break;
        case 'n': 
            b.html('None');
            break;
        default: 
            b.css('background-color', '#ffffff');
            b.css('color','#000000');
            b.css('border-color', '#000');
            b.css('border-style', 'solid');
            b.css('border-width', '1px');
            b.html('Unknown');
            break;
    }
    
    return b;
}

function updateInvaderBadge() {

    fourthBadge = $('#phase-list-fourth-badge');
    ravageBadge = $('#phase-list-ravage-badge');
    buildBadge = $('#phase-list-build-badge');
    exploreBadge = $('#phase-list-explore-badge');

    if (!fourthBadge && !ravageBadge && !buildBadge && !exploreBadge) return;

    fourthBadge.empty();
    ravageBadge.empty();
    buildBadge.empty();
    exploreBadge.empty();

    badges = [fourthBadge, ravageBadge, buildBadge, exploreBadge];

    for (let i = 0; i < 4; i++) {

        // Update badges from explore to ravage
        // Skip first row of adversary badges if not England 3 or above (high immigration)
        if (!(adversary === 'england' && adversaryLevel >= 3) && i === 0) continue;

        if (invaderCards[i].length === 0) {
            badges[i].append(generateBadge('n'))
            continue;
        }

        for (let j = 0; j < invaderCards[i].length; j++) {
            let code = invaderCards[i][j]; // e.g. 3mj, ss
            if (isNaN(code[0])) {
                badges[i].append(generateBadge(code));
                continue;
            }
            if (code.length <= 1) {
                exploreBadge.append(generateBadge('u'));
                continue;
            } 

            // Else if code[0] is a number (stage)...
            level = code[0];
            for (let k = 0; k < code.length-1; k++) {
                badges[i].append(generateBadge(code[k+1]));
            }
            if (i === 3 && level === '2' && code[1] !== 'c') badges[i].append(' + Escalation')
            
        }
        
    }
    
}

function changeBlightCard() {
    if (!confirm('Are you sure you want to flip/change the blight card?')) return;
    if (!blightEnabled) return;
    if (!blightFlipped) {
        blightFlipped = true;
        displayCard('blight', blightSeq[blightSeqIndex]);
        return;
    }
    blightSeqIndex++;
    displayCard('blight', blightSeq[blightSeqIndex]);
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
            displayCard('event', eventSeq[cardHistoryEventIndex]);
            break;
        case 'fear': 
            cardHistoryFearIndex += step;
            displayCard('fear', fearSeq[cardHistoryFearIndex]);
            break;
    }

    updateUI();
    save();
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

// Validate custom sequences before saving
function processCustomSequences() {
    if (!$('#customSequencesEnabled').is(':checked')) {
        return true; // Skip validation if not enabled
    }
    
    invaderSeqInput = $('#customInvaderSequence').val();
    if (invaderSeqInput) {
        // Check if it's comma-separated numbers
        if (invaderSeqInput.includes(',')) {
            invaderLevelSeqCustom = invaderSeqInput.split(',').map(n => (isNaN(parseInt(n.trim())) ? parseInt(n.trim()) : n));
        } else {
            invaderLevelSeqCustom = invaderSeqInput.split(' ').map(n => (isNaN(parseInt(n)) ? parseInt(n) : n));
        }
        
        if (invaderLevelSeqCustom.some(n => !isValidCode(n))) {
            alert('Custom invader sequence must contain only valid codes (e.g. 1, 2, 3s, etc.) separated by spaces or commas');
            return false;
        }
    }
    
    // Validate fear levels
    const levels = [
        $('#fearLevel1').val(),
        $('#fearLevel2').val(),
        $('#fearLevel3').val()
    ];
    
    for (let level of levels) {
        if (isNaN(parseInt(level)) || parseInt(level) < 1) {
            alert('Fear card counts must be positive numbers');
            return false;
        }
    }
    fearLevelSeqCustom = levels;
    return true;
}

function slaveRebellion() {
    
    if (invaderLevelSeq[invaderSeqIndex] < 3) {
        // Return card to under top 3 cards of event deck; draw new event card

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
    else {
        // Discard slave rebellion card; draw new event card
        drawCard('event');
        alert(`A new Event Card is now drawn and displayed. Slave Rebellion has been discarded. `)
    }

    updateUI(); 
    save();
}

function spiritsMayYetDream() {
    if (!(phase === 1 || phase === 6)) {
        alert('You can only use this power during the Fast Power or Slow Power phase. ');
        return;
    }

    if (earnedFearCards === 0) {
        alert('No earned Fear Cards to draw.');
        return;
    }

    // Flip all earned fear cards
    for (let i = 0; i < earnedFearCards; i++) {
        drawCard('fear');
    }

    displayCardHistory('fear', 0);
    for (let i = 0; i < earnedFearCards-1; i++) {
        displayCardHistory('fear', -1);
    }

    cardHistoryFearIndex = fearSeqIndex - earnedFearCards;

    alert(`All earned Fear Cards have been drawn. The earliest drawn Fear Card is now displayed. Switch between drawn Fear Cards using the Card History buttons. `)
    earnedFearCards = 0;

    updateUI();
    save();
}

function terrorSpikesUpwards() {
    // Resolve first earned fear card now

    if (earnedFearCards === 0) {
        alert('No earned Fear Cards to draw.');
        return;
    }

    drawCard('fear');
    earnedFearCards--;
    updateUI();
    save();
}

function fracturedDaysPower(deck, strength) { 

    if (![1,6].includes(phase)) {
        alert('You can only use these powers during the Fast Power or Slow Power phase. ');
        return;
    }

    // Deck: 0 is invader; 1 is event
    // Strength: 0 is weak, 1 is strong

    if (deck === 0) {
        // Invader deck
        let stage = 0;
        let invaderCode = invaderSeq[invaderSeqIndex];

        if (strength === 0) {
            
            stage = codeToLevel(invaderCode);
            if (isNaN(stage)) {
                stage = 0;
                terrain = invaderCode;
                alert(`The top card of the Invader Deck is a ${invaderCardDict[terrain]} card. You shuffle it with the second card of the deck. `);
            } else {
                terrain = invaderCode[1];
                alert(`The top card of the Invader Deck is a Stage ${stage} ${invaderCardDict[terrain]} card. You shuffle it with the second card of the deck.`);
            }

            if (Math.random() >= 0.5) {
                // Shuffle two top cards
                invaderSeq[invaderSeqIndex] = invaderSeq[invaderSeqIndex+1];
                invaderSeq[invaderSeqIndex+1] = invaderCode;
            }
            
        } else if (strength === 1) {
            stage = codeToLevel(invaderCode);
            let msg = '';
            if (isNaN(stage)) {
                stage = 0;
                terrain = invaderCode;
                msg = `The top card of the Invader Deck is a ${invaderCardDict[terrain]} card. `
            } else {
                terrain = invaderCode[1];
                msg = `The top card of the Invader Deck is a Stage ${stage} ${invaderCardDict[terrain]} card. `;
            }
            alert(msg + 'Use the next button to move it to the bottom of the Invader Deck. ');

        } else if (strength === 9) {
            invaderSeqFirst = invaderSeq.splice(invaderSeqIndex, 1); // Returns an array instead of single element
            invaderSeq.push(invaderSeqFirst);
        }
        
    }
    if (deck === 1) {
        if (strength === 0) {
            card = (turnRandomNumber >= 0.5 ? eventSeq[eventSeqIndex] : eventSeq[eventSeqIndex+1]);
            displayCard('event', card);
            alert(`The top card of the Event Deck is now displayed. You shuffle it with the second card of the Deck. `);
        } else if (strength === 1) {
            card = eventSeq[eventSeqIndex];
            displayCard('event', card);
            alert(`The top card of the Event Deck is now displayed. Use the next button to move it to the bottom of the Event Deck. `);
        }
        else if (strength === 9) {
            eventSeqFirst = eventSeq.splice(eventSeqIndex, 1);
            eventSeq.push(eventSeqFirst);
            alert(`The top card of the Event Deck is now moved to the bottom of the Event Deck. `);
        }
    }
    updateUI();
    save();
}


function isValidCode(code) {
    if (code.length > 2) return false;
    if (code.length === 1) {
        if (isNaN(parseInt(code))) return false;
    }
    if (code.length === 2) {
        if (!isNaN(code[0]) && !level1.includes(code) && !level2.includes(code) && !level3.includes(code)) return false;
    }
    return true;
}

function codeToLevel(code) {
    if (isNaN(code[0])) return code;
    return parseInt(code[0]);
}