// Initialize current phase index
// 0: Spirit phase
// 1: Fast power
// 2: Blight
// 3: Event
// 4: Fear
// 5: Invader
// 6: Slow power

var phase = 0;
var activeListItemClass = 'list-group-item-dark';

var phaseList = null;
var phaseListLength = 0;

var fearProgress = null;
var leftBarFearBadge = null;
var phaseListFearBadge = null;
var fear = 0;
var earnedFearCards = 0;
var fearMax = 8;

// Initialize when DOM is ready
$( document ).ready(function() {

    phaseList = $('.list-group-item');
    fearProgress = $('#fear-progress');

    // Highlight the first phase on page load
    if (phaseList.length > 0) {
        setPhase(0);
        phaseListLength = phaseList.length;
    }

    // Add click handler to the button

    $('#btn-next-phase').on('click', function() {
        nextStep();
    });

    $('#btn-add-fear').on('click', function() {
        addFear();
    });


    leftBarFearBadge = $('#left-bar-fear-badge');
    phaseListFearBadge = $('#phase-list-fear-badge');
    if (leftBarFearBadge && phaseListFearBadge) {
        updateFearBadge();
    }
});



// Add click handler to the button
function nextStep() {

    setPhase((phase + 1) % phaseListLength);

    if (phase === 4) {
        if (earnedFearCards > 0) {
            drawCard('fear');
            earnedFearCards--;
            updateFearBadge();
            return;
        }
        else if (earnedFearCards === 0) {
            setPhase((phase + 1) % phaseListLength);
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
    
    fearProgress.setAttribute('style', 'width: ' + fear / fearMax * 100 + '%');
    fearProgress.innerHTML = fear + ' / ' + fearMax;
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
    console.log('Update badge to show ' + earnedFearCards + ' fear cards. ')
    if (earnedFearCards == 0) {
        phaseListFearBadge.hide();
    }
    else {
        phaseListFearBadge.show();
    }

    leftBarFearBadge.innerHTML = earnedFearCards;
    phaseListFearBadge.innerHTML = earnedFearCards;

}

// Function to draw and display a random card
function drawCard(type) {
    // Get the card display div
    const cardDisplay = document.getElementById('main-card-display');

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

        // Clear previous content and add new image
        cardDisplay.innerHTML = '';
        cardDisplay.appendChild(img);

        console.log(`Drew ${type} card: ${random}.jpg`);
    }
}

// Function to set phase programmatically
function setPhase(index) {
    phaseList[phase].classList.remove(activeListItemClass);
    
    if (index >= 0 && index < phaseListLength)
        phase = index;
    else
        phase = 0;

    phaseList[phase].classList.add(activeListItemClass);

    const currentPhaseName = phaseList[phase].querySelector('.phase-list-title').textContent;
    console.log('Set phase to be ', currentPhaseName);
}
