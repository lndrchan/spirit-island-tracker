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

var invaderLevelSeq = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3];
var invaderSeq = [];

// To store serialised game state for gamesaves persisting between sessions
var state = [];

// Initialisations
jQuery(function() {

    phaseList = $('#phase-list');
    fearProgress = $('#fear-progress');

    phaseListLength = 8;


    $('#btn-next-phase').on('click', function() {
        nextStep();
    });

    $('#btn-add-fear').on('click', function() {
        addFear();
    });


    leftBarFearBadge = $('#left-bar-fear-badge');
    phaseListFearBadge = $('#phase-list-fear-badge');
    updateFearBadge();

    cardDisplay = $('#main-card-display');

    setPhase(0);
});



// Add click handler to the button
function nextStep() {

    if (phase === 4 && earnedFearCards > 0) {
        drawCard('fear');
        earnedFearCards--;
        updateFearBadge();
        return;
    }

    setPhase((phase + 1) % phaseListLength);

    if (phase === 4) {
        if (earnedFearCards === 0) {
            setPhase((phase + 1) % phaseListLength);
        }
        else {
            drawCard('fear');
            earnedFearCards--;
            updateFearBadge();
            return;
        }
    }


    if (phase === 3) {
        drawCard('event');
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
        // Create image element
        let img = document.createElement('img');
        random = 0;

        switch (type)
        {
            case 'fear':
                random = Math.floor(Math.random() * 51) + 1;
                img.src = `/static/assets/fear/${random}.jpg`;

                break;
            case 'event':
                random = Math.floor(Math.random() * 58 + 1);
                img.src = `/static/assets/event/${random}.jpg`;
                break;
        }

        img.className = 'game-card';

        clearCardDisplay();
        cardDisplay.append(img);

        console.log(`drawCard: ${type}, ${random}.jpg`);
    }
}

// Function to set phase programmatically
function setPhase(index) {
    console.log('Set phase to be ' + index);

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

function generateInvaderSeq(levelSeq) {

    let level1 = ['1w', '1s', '1j', '1m'];
    let level2 = ['2w', '2s', '2j', '2m', '2c'];
    let level3 = ['3js', '3jw', '3mj', '3mw', '3sm', '3sw'];

    invaderSeq = [];

    for (let i = 0; i < levelSeq.length; i++) {
        level = levelSeq[i];
        if (level === 1) {
            invaderSeq.push(level1[Math.floor(Math.random() * 4)]);
        } 
        else if (level === 2) {
            invaderSeq.push(level2[Math.floor(Math.random() * 5)]);
        }
        else if (level === 3) {
            invaderSeq.push(level3[Math.floor(Math.random() * 6)]);
        }
    }
}

function generateSeq(n) {
    let output = Array(n);
    let orderedArray = Array.from({ length: n }, (_, i) => i);

    for (let i = 0; i < n; i++) {
        output[n]
    }
}