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

var phaseList = null;
var phaseListLength = 0;
var maxPhaseListHeight = 4;
var phaseListDict = {
    0: '<div> <h3 class="phase-list-title">Spirit Phase</h3>    <ul><li>Growth options</li><li>Gain energy</li><li>Choose and pay for cards</li></ul> </div>',
    1: '<h3 class="phase-list-title">Fast Powers</h3>',
    2: '<h3 class="phase-list-title">Blighted Island Effect</h3>',
    3: '<h3 class="phase-list-title">Events</h3>',
    4: '<h3 class="phase-list-title">Fear Cards</h3> <span class="badge badge-primary badge-pill fear-badge" id="phase-list-fear-badge">2</span>',
    5: '<div> <h3 class="phase-list-title">Invader Phase</h3>    <ul><li>Ravage</li><li>Build</li><li>Explore</li></ul> </div>',
    6: '<h3 class="phase-list-title">Slow Powers</h3>',
    7: '<h3 class="phase-list-title">Time Passes</h3>'
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
var invaderSeq = [];
var turn = 0;
var fearSeq = Array(50);
var fearSeqIndex = 0;
var eventSeq = Array(62);
var eventSeqIndex = 0;

// To store serialised game state for gamesaves persisting between sessions
var state = [];

// Initialisations
jQuery(function() {

    fearSeq = generateSeq(50);
    eventSeq = generateSeq(62);
    generateInvaderSeq(invaderLevelSeq);

    invaderCardExplore = $('#invader-card-explore');
    invaderCardBuild = $('#invader-card-build');
    invaderCardRavage = $('#invader-card-ravage');
    invaderCardFourth = $('#invader-card-fourth');
    clearInvaderCard();

    phaseList = $('#phase-list');
    fearProgress = $('#fear-progress');

    phaseListLength = 8;

    ravageBadge = $('#phase-list-ravage-badge');
    buildBadge = $('#phase-list-build-badge');
    exploreBadge = $('#phase-list-explore-badge');

    $('#btn-next-phase').on('click', function() {
        nextStep();
    });
    
    let e = $.Event('keydown');
    e.which = 13;
    $('input').trigger(e, function() {
        nextStep();
    })

 
    $('#btn-add-fear').on('click', function() {
        addFear();
    });


    leftBarFearBadge = $('#left-bar-fear-badge');
    phaseListFearBadge = $('#phase-list-fear-badge');
    updateFearBadge();

    cardDisplay = $('#main-card-display');

    //Start from first invader phase (explore only)
    setPhase(4);
    nextStep();
});

function nextStep() {

    // Check before phase advance: if at fear card phase and still has unresolved fear card, 
    // do not advance phase
    if (phase === 4 && earnedFearCards > 0) {
        drawCard('fear');
        earnedFearCards--;
        updateFearBadge();
        return;
    }

    setPhase((phase + 1) % phaseListLength);

    if (phase === 3) {
        drawCard('event');
        return;
    }

    if (phase === 4) {
        if (earnedFearCards === 0) {
            // Skip fear card phase if there is no earned fear card
            setPhase((phase + 1) % phaseListLength);
        }
        else {
            drawCard('fear');
            earnedFearCards--;
            updateFearBadge();
            return;
        }
    }

    // Invader phase: flip explore card
    if (phase === 5) {
        updateInvaderCardExplore();
        return;
    }

    // Slow power phase: advance invader card
    if (phase === 6) {
        clearInvaderCard();
        turn++;
        updateInvaderCard();
        turn--;
        return;
    }

    // Time passes: advance turn counter
    if (phase === 7) {
        turn++;
        return;
    }
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

    fearProgress.setAttribute('aria-valuenow', fear);
}

function earnFearCard() {
    earnedFearCards ++;
    console.log('Earned fear card. Currently ' + earnedFearCards + ' earned. ')
    updateFearBadge();
}

function updateFearBadge() {
    phaseListFearBadge = $('#phase-list-fear-badge');
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

    if (cardDisplay) {
        let img = document.createElement('img');

        switch (type)
        {
            case 'fear':
                img.src = `/static/assets/fear/${fearSeq[fearSeqIndex]}.jpg`;
                fearSeqIndex++;
                break;
            case 'event':
                img.src = `/static/assets/event/${eventSeq[eventSeqIndex]}.jpg`;
                eventSeqIndex++;
                break;
        }

        img.className = 'game-card';

        clearCardDisplay();
        cardDisplay.append(img);

        console.log(`drawCard: ${type}`);
    }
}

// Function to set phase programmatically
function setPhase(index) {

    let clearDisplayPhases = [0, 1, 2, 5, 6, 7];
    if (clearDisplayPhases.includes(index)) {
        clearCardDisplay();
    }

    let phaseListHTML = '';
    
    if (index >= 0 && index < phaseListLength)
        phase = index;
    else
        phase = 0;

        for (let i = 0; i < maxPhaseListHeight; i++) {

        if (i == 0) {
            phaseListHTML += '<div class="list-group-item d-flex justify-content-between align-items-center list-group-item-dark">';
        }
        else {
            phaseListHTML += '<div class="list-group-item d-flex justify-content-between align-items-center">';
        }

        phaseListHTML += phaseListDict[(i + phase) % phaseListLength];

        phaseListHTML += '</div>';
    }

    phaseList.html(phaseListHTML);

    updateFearBadge();
}

function clearCardDisplay() {
    cardDisplay.html('');
}

function clearInvaderCard() {
    invaderCardExplore.html('');
    invaderCardBuild.html('');
    invaderCardRavage.html('');
    invaderCardFourth.html('');
}

function updateInvaderCard() {

    clearInvaderCard();

    let img = document.createElement('img');
    img.classList.add('game-card', 'game-card-invader');
    img.src = `/static/assets/invader/${invaderLevelSeq[turn]}.jpg`;
    invaderCardExplore.append(img);

    if (turn < 1) return;

    img = document.createElement('img');
    img.classList.add('game-card', 'game-card-invader');
    img.src = `/static/assets/invader/${invaderSeq[turn - 1]}.jpg`;
    invaderCardBuild.append(img);

    if (turn < 2) return;

    img = document.createElement('img');
    img.classList.add('game-card', 'game-card-invader');
    img.src = `/static/assets/invader/${invaderSeq[turn - 2]}.jpg`;
    invaderCardRavage.append(img);

    if (turn < 3) return;

    img = document.createElement('img');
    img.classList.add('game-card', 'game-card-invader');
    img.src = `/static/assets/invader/${invaderSeq[turn - 3]}.jpg`;
    invaderCardFourth.append(img);
}

function updateInvaderCardExplore() {
    let img = document.createElement('img');
    img.classList.add('game-card', 'game-card-invader');
    img.src = `/static/assets/invader/${invaderSeq[turn]}.jpg`;

    invaderCardExplore.html('');
    invaderCardExplore.append(img);
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
    let b = document.createElement('span');
    
    switch (terrain) {
        case 's': 
            b.attr('background-color', '$yellow-200');
            b.html('Sand');
            break;
    }
}

function updateInvaderBadge(showExplore) {

    ravageBadge.empty();
    buildBadge.empty();
    exploreBadge.empty();

    badges = [exploreBadge, buildBadge, ravageBadge];

    let level = 0;

    for (let i = 0; i < 3; i++) {
        if (i === 0 && !showExplore) {
            exploreBadge.append(generateBadge('u'));
            continue;
        }
        
        level = invaderLevelSeq[turn];
        if (level === 1 || level === 2) {
            badges[i].append(generateBadge(invaderSeq[turn][1]));
        }
        else if (level === 3) {
            badges[i].append(generateBadge(invaderSeq[turn][1]), generateBadge(invaderSeq[turn][2]));
        }
    
        if (turn < 1) return;
    }
    

}