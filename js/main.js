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
var phaseListAnimating = false;
var phaseListAnimRemaining = 0;
var phaseListAnimCallback = null;
var phaseListAnimTimeout = null;
// Headings for phase list
var phaseListDict = {
    0: 'Spirit Phase',
    1: 'Fast Powers',
    2: 'Blighted Island',
    3: 'Events',
    4: 'Fear Cards',
    5: 'Invader Actions',
    6: 'Slow Powers',
    7: 'Time Passes'
};

var phaseListIcon = {
    0: '<img src="./assets/symbol/token.png" class="inverted">',
    1: '<img src="./assets/symbol/fast.png" class="brightness">',
    2: '<img src="./assets/symbol/blight.png" class="inverted">',
    3: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-fire" viewBox="0 0 16 16"><path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/></svg>',
    4: '<img src="./assets/symbol/fear.png" class="inverted">',
    5: '<img src="./assets/symbol/explorer.png" class="inverted">',
    6: '<img src="./assets/symbol/slow.png" class="brightness">',
    7: 'Time Passes'
}

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

var expansions = [];

var cardDisplay = null;
var terrorLevelDisplay = null;

var invaderCardFourth;
var invaderCardRavage; 
var invaderCardBuild; 
var invaderCardExplore;
var invaderCards = [[],[],[],[]]; // Store invader codes
var invaderCardActions = {
    fourth: {
        blight: false,
        event: false,
        fear: false
    },
    ravage: {
        lock: false,
        blight: false,
        event: false,
        fear: false
    },
    build: {
        lock: false,
        blight: false,
        event: false,
        fear: false
    },
    explore: {
        blight: false,
        event: false,
        fear: false
    }
}

var ravageBadge = null;
var buildBadge = null;
var exploreBadge = null;

var invaderLevelSeq = [];
var invaderSeq = []; // [1s, 1w, 2c ... ]
var invaderSeqIndex = 0;
var exploreRevealed = false;
var invaderLevelSeqCustom = [];

var turn = 0;
var turnRandomNumber = 0;

var blightSeq = Array(BLIGHT_CARD_COUNT);
var blightSeqIndex = 0;
var blightFlipped = false;

var BLIGHT_CARD_COUNT = 23;
var FEAR_CARD_COUNT = 50;
var EVENT_CARD_COUNT = 62;

var fearDeck = [[], [], []];       // Cards organized by terror level [TL1, TL2, TL3]
var fearDeckIndex = [0, 0, 0];     // How many consumed from each level
var fearEarnedQueue = [];           // Cards earned but not yet revealed: [{card, level}]
var fearDiscardPile = [];           // Revealed fear cards in order
var fearRevealedCards = {};         // {"level_index": true} for peeked cards in deck

var invaderDiscardPile = [];        // Discarded invader cards
var eventSeq = Array(EVENT_CARD_COUNT);
var eventSeqIndex = 0;

var saveIndex = 0;

var cardDisplayType = ''; // 'fear', 'event', 'blight', 'adversary', ''
var cardDisplayContent = ''; // id of card being displayed


// Special action-specific variables

var fracturedDaysPeekedType = 0; // legacy, unused

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

        // Update active state on list group items
        $('.adversary-list-group .list-group-item').removeClass('active');
        $(this).closest('.list-group-item').addClass('active');

        if (selectedAdversary !== 'none' && imagePath) {
            // Show adversary level selector
            $('#adversaryLevelGroup').slideDown(function() { $(this).css('display', 'flex'); });
            
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
        $('#adversary-intro-container').html(adversaryIntroText[selectedAdversary]);
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

    $('#fear-deck-toggle, #fear-deck-toggle-area').on('click', function(e) {
        e.stopPropagation();
        let $icon = $('#fear-deck-toggle-icon');
        let isOpen = $('.fear-card-control').is(':visible');
        if (!isOpen) {
            renderFearDeckInline();
            $icon.removeClass('bi-caret-down-fill').addClass('bi-caret-up-fill');
        } else {
            $icon.removeClass('bi-caret-up-fill').addClass('bi-caret-down-fill');
        }
        $('.fear-card-control').slideToggle();
    });

    // Card action button click handler
    $('.btn-card-action').on('click', function() {

        let currentCards = {
            'blight': blightFlipped ? blightSeq[blightSeqIndex] : 'back',
            'event': eventSeq[eventSeqIndex-1],
            'fear': fearDiscardPile.length > 0 ? fearDiscardPile[fearDiscardPile.length - 1] : null
        }

        if (phase >= 5) {
            if ($(this).data('action') === 'lock') return;
            if ($(this).hasClass('active')) {
                displayCard($(this).data('action'), currentCards[$(this).data('action')]);
            }
            return;
        }

        // Toggle active class
        $(this).toggleClass('active');
        invaderCardActions[$(this).data('card')][$(this).data('action')] = $(this).hasClass('active');
        save();
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
    if (phase === 5 && invaderSeqIndex > invaderSeq.length) {
        alert('The Invaders have taken over Spirit Island. You have lost...');
        return;
    }

    // Invader phase sub-step: reveal explore card on second click
    if (phase === 5 && !exploreRevealed) {
        exploreRevealed = true;
        updateInvaderCard(true);
        updateInvaderBadge(true);
        if (!invaderCardActions['explore']['lock']) invaderSeqIndex++;
        updateUI();
        save();
        return;
    }

    if (phase === 5 && turn === 0) {
        advancePhaseList(3, function() {
            advanceInvaderCard();
            turn++;
            resetInvaderCardActions();
            turnRandomNumber = Math.random();
            updateUI();
            save();
        });
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
        updateUI();
        save();
        return;
    }

    advancePhaseList(1);

    // Clear Fractured Days preview when leaving fast/slow power phases
    if (phase !== 1 && phase !== 6 && fdRevealedCard) {
        fdClearPreview();
    }

    if (phase === 0) {
        turn++;
        resetInvaderCardActions();
        turnRandomNumber = Math.random();
        $('#turn-count-display').html(turn);
        $('#total-turn-count-display').html(invaderSeq.length);
    }

    if (phase === 2) {
        if (!blightEnabled) {
            displayCard('', `
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
        if (earnedFearCards === 0) {
            displayCard('', `
                <div class="preview-placeholder cantora-one">
                    <i class="text-muted">No cards to resolve</i>
                </div>
            `);
        }
        else {
            drawCard('fear');
            updateFearBadge();
        }
    }

    // Invader phase: enter without revealing explore card yet
    if (phase === 5) {
        exploreRevealed = false;
        updateInvaderCard(false);
        updateInvaderBadge(false);
        updateUI();
        displayCard('adversary', adversary)
    }

    // Slow power phase: advance invader card
    if (phase === 6) {
        if (invaderSeqIndex > invaderSeq.length) {
            alert('You have reached the end of the Invader Deck. The Invaders will win if Victory is not achieved in this phase...')
            return;
        }
        advanceInvaderCard();
        if (invaderSeqIndex === invaderSeq.length) {
            alert('This is the last turn before time runs out...')
        }
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
            earnFearCardFromDeck();
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
            unearnFearCard();
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

function revealFearCard() {
    if (earnedFearCards === 0) {
        alert('No earned Fear Cards to reveal.');
        return;
    }
    drawCard('fear');
    updateUI();
    save();
}

function addFearCard(tl) {
    addCardToFearLevel(tl);
}

function removeFearCard(doSave) {
    if (terrorLevel >= 3) return;
    if (fearLevelSeq[terrorLevel] <= 0) return;

    // Remove top undrawn card from current terror level
    fearDeck[terrorLevel].splice(fearDeckIndex[terrorLevel], 1);
    fearLevelSeq[terrorLevel]--;

    if (fearLevelSeq[terrorLevel] === 0) {
        terrorLevel++;
        updateTerrorLevel();
    }

    updateUI();
    if (doSave) save();
}

function unearnFearCard() {
    if (fearEarnedQueue.length === 0) return;

    let entry = fearEarnedQueue.pop();
    // Return card to its level in the deck
    let level = entry.level;

    // If terror level advanced past this level, revert it
    if (terrorLevel > level && fearLevelSeq[level] === 0) {
        terrorLevel = level;
    }

    fearDeckIndex[level]--;
    fearLevelSeq[level]++;
    earnedFearCards = fearEarnedQueue.length;
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

    if (leftBarFearBadge && leftBarFearBadge.length) leftBarFearBadge.html(earnedFearCards);

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
            let fearCard = drawFearCardFromQueue();
            if (fearCard !== null) {
                displayCard('fear', fearCard);
            }
            break;
        case 'event':
            if (!eventEnabled) return;
            if (turn == 1) {
                displayCard('', `
                    <div class="preview-placeholder cantora-one">
                        <i class="text-muted">No Event Card drawn on Turn 1. The top Event Card has been discarded. </i>
                    </div>
                `)
                eventSeqIndex++;
                return;
            }
            displayCard('event', eventSeq[eventSeqIndex])
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
                eventSeq = generateSeq('event');
                eventSeqIndex = 0;
            }
            break;
    }
}

function displayCard(type, content) {

    if (type == 'adversary' && content == 'none') {
        type = '';
        content = '';
    }
    if (content == 'none') content = '';

    if (type === 'blight' && !blightFlipped) content = 'back';

    cardDisplayType = type;
    cardDisplayContent = content;

    // Fade out container
    cardDisplay.fadeOut(300, function() {
        // Clear and add new image
        cardDisplay.empty();
        
        if (type === '') {
            cardDisplay.html(content);
            cardDisplay.fadeIn(300);
            return;
        }
        const $img = $('<img>')
            .addClass('game-card')
            .attr('src', `./assets/${type}/${content}.jpg`)
            .attr('data-action', 'zoom');
        
        if (type === 'adversary') {
            $img.addClass('game-card-h');
        }
        
        // Add image and fade container back in
        cardDisplay.append($img).fadeIn(300, function() {
            // Remove inline styles after fade completes
            cardDisplay.css({
                'opacity': '',
                'display': ''
            });
            $img.css({
                'opacity': '',
                'display': ''
            });
        });
    });

    updateUI();
}

function redraw() {
    if (phase === 3) {
        // Event card phase
        if (eventSeqIndex >= eventSeq.length-1) eventSeq = generateSeq('event');
        eventSeq[eventSeqIndex-1] = eventSeq.pop();
        displayCard('event', eventSeq[eventSeqIndex-1]);
    }
    else if (phase === 4) {
        // Fear card phase — replace last drawn fear card with a random unused one
        let allFearCards = generateSeq('fear');
        let usedCards = [];
        for (let l = 0; l < 3; l++) usedCards = usedCards.concat(fearDeck[l]);
        usedCards = usedCards.concat(fearDiscardPile);
        usedCards = usedCards.concat(fearEarnedQueue.map(e => e.card));
        let available = allFearCards.filter(c => !usedCards.includes(c));
        if (available.length > 0) {
            let newCard = available[Math.floor(Math.random() * available.length)];
            fearDiscardPile[fearDiscardPile.length - 1] = newCard;
            displayCard('fear', newCard);
        }
    }
}

function removeInvaderCard() {
    invaderSeqIndex++;
    updateInvaderCard(false);
    updateUI();
    save();
}

function accelerateInvaderCard() {
    for (let i = invaderSeqIndex; i < invaderSeq.length; i++) {
        if (codeToLevel(invaderSeq[i]) === Math.min(...invaderLevelSeq.slice(invaderSeqIndex))) {
            code = invaderSeq.splice(i, 1)[0];
            invaderLevelSeq.splice(i, 1);
            alert(`The top Invader Card has been removed from the deck. It was a ${codeToString(code)} Card. `)
            break;
        }
    }
    if (phase === 5 && exploreRevealed) {updateInvaderCard(true);} else {updateInvaderCard(false);}
    updateUI();
    save();
}

// Remove first item of phase list and generate new phase list item at bottom of list
function advancePhaseList(count, onComplete) {

    // If phase list empty, populate it before anything else
    if ($('.list-group-item', phaseList).length < phaseListDisplayLength) {
        updatePhaseList();
    }

    // If animation already running, fast-forward it
    if (phaseListAnimating) {
        finishPhaseListAnimation();
    }

    // Store remaining steps and callback for chaining
    phaseListAnimRemaining = count - 1;
    phaseListAnimCallback = onComplete || null;

    // Animate the first step
    advancePhaseListAnimated();
}

// Instant (non-animated) single step — used by finishPhaseListAnimation to drain queue
function advancePhaseListStep() {
    phase = (phase + 1) % phaseCount;

    let children = $('.list-group-item', phaseList);

    if (children && children.length === phaseListDisplayLength) {
        children[0].remove();

        $(children[1]).removeClass('list-group-item-dark').addClass('text-body-tertiary');
        $(children[1]).children('.phase-list-title').nextAll().remove();

        $(children[2]).addClass('list-group-item-dark');
        $('.phase-list-title', children[2]).after('<span style="float: right;" class="badge rounded-pill bg-primary" id="current-badge"> <i>Current</i> </span>');
    }

    updateFearBadge();

    let newPhaseListItemIndex = (phase + phaseListDisplayLength - 2) % phaseCount;
    phaseList.append(generatePhaseListItem(newPhaseListItemIndex));

    if (newPhaseListItemIndex === 5) {
        updateInvaderBadge();
    }
}

// Animated single step
function advancePhaseListAnimated() {
    let children = $('.list-group-item', phaseList);
    if (!children || children.length < phaseListDisplayLength) {
        advancePhaseListStep();
        finishPhaseListAnimStep();
        return;
    }

    phaseListAnimating = true;

    // 1. Measure the outgoing item height
    let exitingItem = $(children[0]);
    let itemHeight = exitingItem.outerHeight(true);

    // 2. Advance phase state
    phase = (phase + 1) % phaseCount;

    // 3. Mark the exiting item
    exitingItem.addClass('phase-list-item-exiting');

    // 4. Append new item at the bottom (starts invisible)
    updateFearBadge();
    let newPhaseListItemIndex = (phase + phaseListDisplayLength - 2) % phaseCount;
    let newItem = generatePhaseListItem(newPhaseListItemIndex);
    newItem.addClass('phase-list-item-entering');
    phaseList.append(newItem);
    if (newPhaseListItemIndex === 5) {
        updateInvaderBadge();
    }

    // 5. Measure and fix sub-item heights on previous-current item for collapse animation
    let fadeTargets = $(children[1]).children('.phase-list-title').nextAll();
    fadeTargets.filter('ul').each(function() {
        var $el = $(this);
        $el.css({ 'height': $el.outerHeight() + 'px', 'overflow': 'hidden' });
    });

    // 6. Force reflow so browser registers starting state
    phaseList[0].offsetHeight;

    // 7. Enable transitions, slide ALL items up, fade exiting out, fade new in
    phaseList.addClass('phase-list-animating');

    let allItems = $('.list-group-item', phaseList);
    allItems.css('transform', 'translateY(-' + itemHeight + 'px)');

    exitingItem.css('opacity', '0');
    newItem.removeClass('phase-list-item-entering');

    // Highlight changes (fade out old, fade in new, collapse sub-items)
    $(children[1]).removeClass('list-group-item-dark').addClass('text-body-tertiary');
    fadeTargets.addClass('phase-list-fade-out');
    fadeTargets.filter('ul').css({ 'height': '0', 'margin': '0' });
    $(children[2]).addClass('list-group-item-dark');
    $('.phase-list-title', children[2]).after('<span style="float: right;" class="badge rounded-pill bg-primary" id="current-badge"> <i>Current</i> </span>');

    // 7. Clean up on transition end
    $(children[1]).one('transitionend', function() {
        finishPhaseListAnimStep();
    });

    // Safety timeout in case transitionend doesn't fire
    phaseListAnimTimeout = setTimeout(function() {
        phaseListAnimTimeout = null;
        if (phaseListAnimating) {
            finishPhaseListAnimStep();
        }
    }, 350);
}

// Clean up after one animated step, then chain next step or finish
function finishPhaseListAnimStep() {
    // Clear safety timeout to prevent double-firing during chained animations
    if (phaseListAnimTimeout) {
        clearTimeout(phaseListAnimTimeout);
        phaseListAnimTimeout = null;
    }

    // Remove the exiting item and clear animation state
    $('.phase-list-item-exiting', phaseList).remove();
    phaseList.removeClass('phase-list-animating');
    $('.list-group-item', phaseList).css({'transform': '', 'opacity': ''}).removeClass('phase-list-item-entering');

    // Remove sub-items and old Current badge from previous item (deferred to avoid layout shift during animation)
    $('.list-group-item', phaseList).first().children('.phase-list-title').nextAll().remove();

    // Chain next step if remaining
    if (phaseListAnimRemaining > 0) {
        phaseListAnimRemaining--;
        advancePhaseListAnimated();
    } else {
        phaseListAnimating = false;
        if (phaseListAnimCallback) {
            var cb = phaseListAnimCallback;
            phaseListAnimCallback = null;
            cb();
        }
    }
}

// Fast-forward: instantly complete all remaining animation steps
function finishPhaseListAnimation() {
    // Clean up current animation visuals
    $('.phase-list-item-exiting', phaseList).remove();
    phaseList.removeClass('phase-list-animating');
    $('.list-group-item', phaseList).css({'transform': '', 'opacity': ''}).removeClass('phase-list-item-entering');
    $('.phase-list-fade-out', phaseList).css({'height': '', 'overflow': '', 'margin': ''}).removeClass('phase-list-fade-out');

    // Drain remaining queued steps instantly
    while (phaseListAnimRemaining > 0) {
        advancePhaseListStep();
        phaseListAnimRemaining--;
    }

    // Fire callback if any
    if (phaseListAnimCallback) {
        var cb = phaseListAnimCallback;
        phaseListAnimCallback = null;
        cb();
    }

    phaseListAnimating = false;
}

function updatePhaseList() {
    if (phaseListAnimating) finishPhaseListAnimation();
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
    $('<div></div>')
        .addClass('phase-list-icon-container')
        .prependTo(listItem)
        .prepend($(phaseListIcon[phaseIndex])
        .addClass('phase-list-icon'));

    if (phaseIndex === phase) {
        listItem.addClass('list-group-item-dark')
    }
    if (phaseIndex === phase - 1 || (phase === 0 && phaseIndex === phaseCount - 1)) {
        heading.addClass('text-body-tertiary');
        return listItem;
    }
        
    if (phaseIndex === 0) {
        // Spirit phase special texts

        $('<ul style="list-style-type:none; padding-left: 40px;margin-top: 0.5em;margin-bottom: 0em;"></ul>')
            .append('<li>Growth options</li>')
            .append('<li>Gain energy</li>')
            .append('<li>Choose and pay for cards</li>')
            .appendTo(listItem);
    }
    else if (phaseIndex === 1) {
    }
    else if (phaseIndex === 2) {
    }
    else if (phaseIndex === 4) {
        // Fear card phase special texts (fear badge)

        $('<span></span>')
            .addClass('badge text-bg-dark fear-badge')
            .attr('id', 'phase-list-fear-badge')
            .css('float', 'right')
            .html(earnedFearCards)
            .toggle(earnedFearCards > 0)
            .appendTo(listItem);
    }
    else if (phaseIndex === 5) {
        // Invader phase texts

        listItem.removeClass('d-flex');
        let invaderPhaseDescription = $('<ul style="list-style-type:none; padding-left: 40px;margin-top: 0.5em;margin-bottom: 0em;"></ul>');
        invaderPhaseDescription.append('<li id="phase-list-fourth-item" style="display:none;">Build: <span class="badge" id="phase-list-fourth-badge"> </span> </li>')
        invaderPhaseDescription.append('<li>Ravage: <span class="badge" id="phase-list-ravage-badge"> </span> </li>')
        invaderPhaseDescription.append('<li>Build: <span class="badge" id="phase-list-build-badge"> </span> </li>')
        invaderPhaseDescription.append('<li>Explore: <span class="badge" id="phase-list-explore-badge"> </span> </li>')

        invaderPhaseDescription.appendTo(listItem);
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

    if (phaseIndex === phase) {
        heading.after('<span style="float: right;" class="badge rounded-pill bg-primary" id="current-badge"> <i>Current</i> </span>')
    }

    return listItem;
}

function getAdversaryConfig(category) {
    let out = [];
    switch (category) {
        case 'invader':
            for (let i = parseInt(adversaryLevel); out.length === 0; i--) {
                out = adversaryConfig[adversary]['invader'][i];
                if (i === 0) {
                    out = [1,1,1,2,2,2,2,3,3,3,3,3]; // Default sequence
                    break;
                } 
            }
            break;
        case 'fear':
            for (let i = parseInt(adversaryLevel); out.length === 0; i--) {
                out = adversaryConfig[adversary]['fear'][i];
                if (i === 0) {
                    out = [3,3,3]; // Default sequence
                    break;
                }
            }
            break;
    }
    return out;
}

// Function attached to setup modal 'Start Game' button
function setup() {

    localStorage.clear();

    // Testing with Prussia 6. Delete before release. 
    playerCount = $('input[name="playerCount"]:checked').val();
    if (playerCount === 'custom') playerCount = parseInt($('#playerCount-custom-input').val());
    adversary = $('input[name="adversary"]:checked').val();
    adversaryLevel = $('input[name="adversaryLevel"]:checked').val() || 0;

    eventEnabled = $('#eventCardsEnabled').is(':checked');
    blightEnabled = $('#blightCardsEnabled').is(':checked');
    
    $('.expansion-checkbox:checked').each(function() {
        expansions.push($(this).val());
    });

    // Disable event cards if not using expansions that require them (JE, BC, NI)
    if (!expansions.some(exp => ['bc', 'je', 'ni'].includes(exp))) eventEnabled = false;

    // England 6 special rule
    if (adversary === 'england' && adversaryLevel === '6') {
        maxFear = playerCount * 5;
        // Need another line to update invader card area text
    } else {
        maxFear = playerCount * 4;
    }

    if (adversary !== 'none') {
        invaderLevelSeq = getAdversaryConfig('invader').slice();
        fearLevelSeq = getAdversaryConfig('fear').slice();
    }
    else { // No adversary
        invaderLevelSeq = [1,1,1,2,2,2,2,3,3,3,3,3];
        fearLevelSeq = [3,3,3];
    }

    if (!eventEnabled) {
        $('[data-action="event"]').hide();
    }

    if (!blightEnabled) {
        $('[data-action="blight"]').hide();
    }

    if (invaderLevelSeqCustom.length > 0) {
        invaderLevelSeq = invaderLevelSeqCustom;
    }
    if (fearLevelSeqCustom.length > 0) {
        fearLevelSeq = fearLevelSeqCustom;
    }

    fear = 0;

    blightSeq = generateSeq('blight');
    eventSeq = generateSeq('event');

    // Generate fear deck from fearLevelSeq
    fearDeck = generateFearDeck(fearLevelSeq);
    fearDeckIndex = [0, 0, 0];
    fearEarnedQueue = [];
    fearDiscardPile = [];
    fearRevealedCards = {};
    earnedFearCards = 0;
    terrorLevel = 0;

    invaderDiscardPile = [];

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

    // Habsburg Mining Expedition: Preprocess level 2 pool to remove coast card
    if (adversary === 'habsburg-mining' && adversaryLevel >= 4) {
        level2 = level2.filter((item) => item !== '2c'); // Remove '2c'
    }

    if (adversary === 'sweden' && adversaryLevel >= 4) {
        alert('After the first Invader Explore Action, please make sure to Accelerate the Invader Deck using the Special Actions menu. ')
    }

    invaderSeq = generateInvaderSeq(invaderLevelSeq);
    invaderCards = [[],[],[],[invaderSeq[0]]];
    invaderSeqIndex = 1;

    // Start at Turn 0 Invader phase
    phase = 5;

    exploreRevealed = true;
    initUI();
    displayCard('adversary', adversary)
    updatePhaseList();
    updateUI();
    updateInvaderCard(true);

    save();
}

function save() {
    const gameData = {
        version: 2,
        playerCount: playerCount,
        adversary: adversary,
        adversaryLevel: adversaryLevel,
        expansions: expansions,
        eventEnabled: eventEnabled,
        blightEnabled: blightEnabled,
        blightSeq: blightSeq,
        blightSeqIndex: blightSeqIndex,
        blightFlipped: blightFlipped,
        invaderSeq: invaderSeq,
        invaderSeqIndex: invaderSeqIndex,
        invaderLevelSeq: invaderLevelSeq,
        invaderLevelSeqCustom: invaderLevelSeqCustom,
        invaderCardActions: invaderCardActions,
        invaderDiscardPile: invaderDiscardPile,
        fear: fear,
        fearDeck: fearDeck,
        fearDeckIndex: fearDeckIndex,
        fearEarnedQueue: fearEarnedQueue,
        fearDiscardPile: fearDiscardPile,
        fearRevealedCards: fearRevealedCards,
        eventSeq: eventSeq,
        eventSeqIndex: eventSeqIndex,
        turn: turn,
        turnRandomNumber: turnRandomNumber,
        phase: phase,
        maxFear: maxFear,
        earnedFearCards: earnedFearCards,
        fearLevelSeq: fearLevelSeq,
        terrorLevel: terrorLevel,
        cardDisplayContentType: cardDisplayType,
        cardDisplayContent: cardDisplayContent,
        invaderCards: invaderCards,
        fdRevealedCard: fdRevealedCard,
        exploreRevealed: exploreRevealed
    };

    localStorage.setItem(`${saveIndex}`, JSON.stringify(gameData));
    console.log('Game data saved:', saveIndex, gameData);
    saveIndex++;
}

function load(index) {
    try {
        let gameData = JSON.parse(localStorage.getItem(`${index}`));
        if (!gameData) return;

        playerCount = gameData.playerCount ?? 2;
        adversary = gameData.adversary ?? 'none';
        adversaryLevel = gameData.adversaryLevel ?? 0;
        expansions = gameData.expansions ?? [];

        eventEnabled = gameData.eventEnabled ?? true;
        blightEnabled = gameData.blightEnabled ?? true;

        invaderSeq = gameData.invaderSeq ?? [];
        invaderSeqIndex = gameData.invaderSeqIndex ?? 0;
        invaderLevelSeq = gameData.invaderLevelSeq ?? [1,1,1,2,2,2,2,3,3,3,3,3];
        invaderLevelSeqCustom = gameData.invaderLevelSeqCustom ?? [];
        invaderCardActions = gameData.invaderCardActions ?? {
            fourth: { lock: false, blight: false, event: false, fear: false },
            ravage: { lock: false, blight: false, event: false, fear: false },
            build: { lock: false, blight: false, event: false, fear: false },
            explore: { lock: false, blight: false, event: false, fear: false }
        };
        invaderDiscardPile = gameData.invaderDiscardPile ?? [];

        blightSeq = gameData.blightSeq ?? generateSeq('blight');
        blightSeqIndex = gameData.blightSeqIndex ?? 0;
        blightFlipped = gameData.blightFlipped ?? false;

        eventSeq = gameData.eventSeq ?? generateSeq('event');
        eventSeqIndex = gameData.eventSeqIndex ?? 0;

        turn = gameData.turn ?? 0;
        turnRandomNumber = gameData.turnRandomNumber ?? 0;
        phase = gameData.phase ?? 5;

        fear = gameData.fear ?? 0;
        maxFear = gameData.maxFear ?? (playerCount * 4);
        earnedFearCards = gameData.earnedFearCards ?? 0;

        fearLevelSeq = gameData.fearLevelSeq ?? [3, 3, 3];
        terrorLevel = gameData.terrorLevel ?? 0;

        invaderCards = gameData.invaderCards ?? [[], [], [], []];

        fdRevealedCard = gameData.fdRevealedCard ?? null;
        fdShowPreview();
        exploreRevealed = gameData.exploreRevealed ?? (phase === 5);

        // Fear deck migration: if new fearDeck exists, load it; otherwise reconstruct from old save
        if (gameData.fearDeck) {
            fearDeck = gameData.fearDeck;
            fearDeckIndex = gameData.fearDeckIndex ?? [0, 0, 0];
            fearEarnedQueue = gameData.fearEarnedQueue ?? [];
            fearDiscardPile = gameData.fearDiscardPile ?? [];
            fearRevealedCards = gameData.fearRevealedCards ?? {};
        } else {
            // Old save migration: reconstruct deck from fearLevelSeq counts
            let oldFearSeq = gameData.fearSeq ?? generateSeq('fear');
            let oldFearSeqIndex = gameData.fearSeqIndex ?? 0;
            fearDeck = [[], [], []];
            let idx = 0;
            let origFearLevelSeq = (adversary !== 'none') ? getAdversaryConfig('fear') : [3, 3, 3];
            for (let level = 0; level < 3; level++) {
                for (let i = 0; i < origFearLevelSeq[level]; i++) {
                    if (idx < oldFearSeq.length) {
                        fearDeck[level].push(oldFearSeq[idx]);
                        idx++;
                    }
                }
            }
            fearDeckIndex = [0, 0, 0];
            // Mark consumed cards based on how many were removed from each level
            for (let level = 0; level < 3; level++) {
                let consumed = origFearLevelSeq[level] - fearLevelSeq[level];
                fearDeckIndex[level] = Math.max(0, Math.min(consumed, fearDeck[level].length));
            }
            fearDiscardPile = oldFearSeq.slice(0, oldFearSeqIndex);
            fearEarnedQueue = [];
            // Reconstruct earned queue from earnedFearCards count
            for (let i = 0; i < earnedFearCards; i++) {
                let tl = terrorLevel;
                if (tl < 3 && fearDeckIndex[tl] < fearDeck[tl].length) {
                    fearEarnedQueue.push({ card: fearDeck[tl][fearDeckIndex[tl]], level: tl });
                }
            }
            fearRevealedCards = {};
            earnedFearCards = fearEarnedQueue.length;
        }

        try { initUI(); } catch(e) { console.error('initUI error:', e); }
        try { updatePhaseList(); } catch(e) { console.error('updatePhaseList error:', e); }
        try { updateUI(); } catch(e) { console.error('updateUI error:', e); }
        try { displayCard(gameData.cardDisplayContentType ?? '', gameData.cardDisplayContent ?? ''); } catch(e) { console.error('displayCard error:', e); }
        try {
            if (phase === 5 && exploreRevealed) { updateInvaderCard(true); } else { updateInvaderCard(false); }
        } catch(e) { console.error('updateInvaderCard error:', e); }

        if (!eventEnabled) {
            $('[data-action="event"]').hide();
        }

        setupModal.modal('hide');
        setupModal.css('display','none');

        console.log('Game data loaded:', saveIndex, gameData);
    } catch (e) {
        console.error('Failed to load game data:', e);
    }
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

    renderFearEarnedInline();
    renderCardHistories();
    if ($('#fear-deck-inline').is(':visible')) renderFearDeckInline();

    $('#invader-discard-count').text(invaderDiscardPile.length > 0 ? '(' + invaderDiscardPile.length + ')' : '');

    $('#blight-status-badge')
        .toggleClass('text-bg-success', !blightFlipped)
        .toggleClass('text-bg-dark', blightFlipped)
        .text(blightFlipped ? 'Blighted' : 'Healthy');

    fearProgressBar.attr('style', 'width: ' + fear / maxFear * 100 + '%');
    fearProgressBar.html(fear + ' / ' + maxFear);

    // If in invader phase and explore revealed, show explore.
    if (phase === 5 && exploreRevealed) {updateInvaderBadge(true)} else {updateInvaderBadge(false)}
    
    // invaderLevelSeq = invaderSeq.map(code => codeToLevel(code));  

    $('#turn-count-display').html(invaderSeqIndex);
    $('#total-turn-count-display').html(invaderSeq.length);
    $('#invader-level-sequence').html(invaderLevelSeq.slice(invaderSeqIndex).join(' '));

    // MUST RUN THIS AFTER UPDATING INVADER LEVEL SEQUENCE UI
    /*
    for (let i = 0; i < 4; i++) {
        if (codeToLevel(invaderLevelSeq[i]) >= 3) invaderLevelSeq[i] = 2; // Prussia: early stage 3 treated as stage 2
    }
    */

    if (adversary === 'england') {
        // Remove high immigration tile if level is 3
        if (adversaryLevel == 3) {
            let invaderSeqIndexGreaterThanLevel1 = 0;
            for (let i = 0; i < invaderLevelSeq.length; i++) {
                if (invaderLevelSeq[invaderSeqIndexGreaterThanLevel1] > 1) break;
                invaderSeqIndexGreaterThanLevel1 ++;
            }
            if (invaderSeqIndex < invaderSeqIndexGreaterThanLevel1 + 3) {
                if ($('#phase-list-fourth-item')) $('#phase-list-fourth-item').css('display','block');
                $('#invader-card-label-fourth').html('Build 🏴󠁧󠁢󠁥󠁮󠁧󠁿')
            } else {
                // Transition: move any card in the 4th slot to discard pile
                if ($('#invader-card-label-fourth').html() !== 'Discard') {
                    for (let j = 0; j < invaderCards[0].length; j++) {
                        if (invaderCards[0][j] !== 'ss') {
                            invaderDiscardPile.push(invaderCards[0][j]);
                        }
                    }
                }
                if ($('#phase-list-fourth-item')) $('#phase-list-fourth-item').css('display','none');
                $('#invader-card-label-fourth').html('Discard')
            }
        }
        else if (adversaryLevel >= 4) {
            if ($('#phase-list-fourth-item')) $('#phase-list-fourth-item').css('display','block'); 
            $('#invader-card-label-fourth').html('Build 🏴󠁧󠁢󠁥󠁮󠁧󠁿')
        }   
    }

    $('.btn-card-action').each(function() {

        if (invaderCardActions[$(this).data('card')][$(this).data('action')]) {
            if (phase >= 5) {
                $(this).addClass('active-yellow');
            } else {
                $(this).removeClass('active-yellow').addClass('active');
            }
        } else {
            $(this).removeClass('active active-yellow');
        }

    });
    
    let redrawEnabledPhases = [3,4];
    if (redrawEnabledPhases.includes(phase) && turn > 1) {
        $('#redraw-btn').removeAttr('disabled');
    } else {
        $('#redraw-btn').attr('disabled','');
    }

    /*
    let fearBtnDisabledPhases = [4];
    if (fearBtnDisabledPhases.includes(phase)) {
        $('.fear-btn').attr('disabled','');
    } else {
        $('.fear-btn').removeAttr('disabled');
    }
    */

    if (saveIndex == 0) {
        $('#btn-undo').attr('disabled','');
    } else {
        $('#btn-undo').removeAttr('disabled');
    }


}

function initUI() {

    if (!blightEnabled) {
        $('#show-blight-card-btn').css('display','none');
        $('#blight-btn').css('display','none');
    }

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
        $('#adversary-name-display').html(adversaryNameDict[adversary] + ' ' + adversaryLevel + ' (Difficulty ' + adversaryConfig[adversary]['difficulty'][adversaryLevel] + ')');

        let actionChangeIndex = adversaryConfig[adversary]['actionChange'][adversaryLevel];
        for (let i = 0; i < actionChangeIndex.length; i++) {
            invaderCardLabels[actionChangeIndex[i]].append(' ' + adversaryFlagDict[adversary] + ' ');
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

function showBlightCard() {
    if (!blightEnabled) return;
    if (!blightFlipped) {
        displayCard('blight', 'back');
        return;
    }
    displayCard('blight', blightSeq[blightSeqIndex]);
}

function advanceInvaderCard() {

    let highImmigrationActive = false;
    if (adversary === 'england' && adversaryLevel >= 4) {
        highImmigrationActive = true;
    } else if (adversary === 'england' && adversaryLevel == 3) {
        // England 3: high immigration is active only during early game
        let invaderSeqIndexGreaterThanLevel1 = 0;
        for (let i = 0; i < invaderLevelSeq.length; i++) {
            if (invaderLevelSeq[invaderSeqIndexGreaterThanLevel1] > 1) break;
            invaderSeqIndexGreaterThanLevel1++;
        }
        highImmigrationActive = invaderSeqIndex < invaderSeqIndexGreaterThanLevel1 + 3;
    }

    if (highImmigrationActive) {
        // England high immigration: cards are discarded when leaving the 4th slot
        for (let j = 0; j < invaderCards[0].length; j++) {
            if (invaderCards[0][j] !== 'ss') {
                invaderDiscardPile.push(invaderCards[0][j]);
            }
        }
    } else {
        // Normal games: cards are discarded when moving from ravage to the discard slot
        for (let j = 0; j < invaderCards[1].length; j++) {
            if (invaderCards[1][j] !== 'ss' && !invaderCardActions['ravage']['lock']) {
                invaderDiscardPile.push(invaderCards[1][j]);
            }
        }
    }

    for (let i = 0; i < 3; i++) {
        let newArray = [];
        if ((i === 1 && invaderCardActions['ravage']['lock']) || (i === 2 && invaderCardActions['build']['lock'])) newArray = invaderCards[i];

        for (let j = 0; j < invaderCards[i+1].length; j++) {
            // Look at card in next slot one by one and decide whether to move it to current slot
            if (
                (i === 0 && invaderCards[i+1][j] === 'ss') || 
                (i === 0 && invaderCardActions['ravage']['lock']) || 
                (i === 1 && invaderCardActions['build']['lock']) ||
                (i === 2 && invaderCardActions['explore']['lock'])
            ) 
                {continue};
            
            if (i === 1 && invaderCards[i][j] === 'ss') {
                newArray.push('ss');
            }
            newArray.push(invaderCards[i+1][j]);
        }

        invaderCards[i] = newArray;
    }
    
    let nextCard = invaderSeq[invaderSeqIndex];

    if (nextCard) {
        invaderCards[3] = [nextCard];
    } else {
        invaderCards[3] = [];
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

    for (let i = 0; i < 4; i++) {
        slots[i].empty();
        if (!invaderCards[i]) continue; // Skip slot if no cards in invaderCards[i]
        for (let j = 0; j < invaderCards[i].length; j++) {
            let card = (i === 3 && (!showExploreCard || invaderCardActions['explore']['lock'])) ? codeToLevel(invaderCards[i][j]) : invaderCards[i][j];
            slots[i].append(generateInvaderCard(card))
        }
    }
}

function generateInvaderSeq(levelSeq) {

    // levelSeq: defined in adversary-config under each 'invader' section

    output = Array(levelSeq.length);
    let index = 0;

    for (let i = 0; i < levelSeq.length; i++) {
        if (isNaN(levelSeq[i])) {
            // If not a number, it is a specified invader card code. 
            // Prioritise its position in invader card sequence.
            output[i] = levelSeq[i];
            if (level1.indexOf(levelSeq[i]) > -1) level1.splice(level1.indexOf(levelSeq[i]), 1);
            if (level2.indexOf(levelSeq[i]) > -1) level2.splice(level2.indexOf(levelSeq[i]), 1);
            if (level3.indexOf(levelSeq[i]) > -1) level3.splice(level3.indexOf(levelSeq[i]), 1);
        }
    }

    for (let i = 0; i < levelSeq.length; i++) {
        level = parseInt(levelSeq[i]);
        if (output[i] !== undefined) continue; // Pre-filled slot
        if (level == 1) {
            index = Math.floor(Math.random() * level1.length);
            output[i] = (level1[index]);
            level1.splice(index, 1);
        } 
        else if (level == 2) {
            index = Math.floor(Math.random() * level2.length);
            output[i] = (level2[index]);
            level2.splice(index, 1);
        }
        else if (level == 3) {
            index = Math.floor(Math.random() * level3.length);
            output[i] = (level3[index]);
            level3.splice(index, 1);
        }
    }

    return output;
}

function generateSeq(type) {
    let length = 0; 
    switch (type) {
        case 'blight':
            length = BLIGHT_CARD_COUNT;
            break;
        case 'fear':
            length = FEAR_CARD_COUNT;
            break;
        case 'event':
            length = EVENT_CARD_COUNT;
            break;
    }
    let output = Array(length);
    let orderedArray = range(1, length);

    for (let i = 0; i < length; i++) {
        let random = Math.floor(Math.random() * (length-i));
        output[i] = orderedArray[random];
        orderedArray.splice(random, 1);
    }

    let unusedExpansions = ['bc','ff','je','ni'].filter(exp => !expansions.includes(exp));
    for (let expansion of unusedExpansions) {
        if (expansionCards[expansion]) {
            output = output.filter(card => !expansionCards[expansion][type].includes(card));
        }
    }
    
    return output;
}

function generateBadge(terrain) {
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

function updateInvaderBadge(showExplore) {

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
            if (i === 3 && (!showExplore || invaderCardActions['explore']['lock'])) {
                badges[i].append(generateBadge('u'));
                continue;
            } 

            // Else if code[0] is a number (stage)...
            level = code[0];
            for (let k = 0; k < code.length-1; k++) {
                badges[i].append(generateBadge(code[k+1]));
            }
            if (i === 3 && level === '2' && code[1] !== 'c') badges[i].append(' + Escalation')
            if (j < invaderCards[i].length - 1) badges[i].append(', ');
        }
        
    }
    
}

function redrawBlightCard() {
    if (!confirm('Are you sure you want to flip/change the blight card?')) return;
    if (!blightEnabled) return;
    if (!blightFlipped) {
        blightFlipped = true;
        displayCard('blight', blightSeq[blightSeqIndex]);
        save();
        return;
    }

    if (blightSeqIndex >= blightSeq.length-1) blightSeq = generateSeq('blight');
    blightSeqIndex = 0;
    displayCard('blight', blightSeq[blightSeqIndex]);
    blightSeqIndex++;
    save();
}

function validateSetupForm() {
    let playerCount = $('input[name="playerCount"]:checked').val();
    let adversary = $('input[name="adversary"]:checked').val();
    
    if (!playerCount) {
        alert('Please select number of players');
        return false;
    }
    if (playerCount === 'custom') {
        const customVal = parseInt($('#playerCount-custom-input').val());
        if (!customVal || customVal < 1 || !Number.isInteger(customVal)) {
            alert('Please enter a valid number of players');
            return false;
        }
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
        if (parseInt(level) < 1) {
            alert('Fear card counts must be positive numbers');
            return false;
        }
        if (isNaN(parseInt(level))){
            fearLevelSeqCustom = [];
            return true;
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
            eventSeq = generateSeq('event');
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

    let count = fearEarnedQueue.length;
    if (count === 0) {
        alert('No earned Fear Cards to reveal.');
        return;
    }

    // Flip all earned fear cards
    let firstIndex = fearDiscardPile.length;
    for (let i = 0; i < count; i++) {
        drawCard('fear');
    }

    displayCard('fear', fearDiscardPile[firstIndex]);

    updateUI();
    save();
}

var fdState = null; // { power: 'top'|'bottom', deck: 'invader'|'event' }
var fdRevealedCard = null; // { type: 'invader'|'event', src: '...' } persists until phase ends

function fdLook(power, deck) {
    if (![1,6].includes(phase)) {
        alert('You can only use these powers during the Fast Power or Slow Power phase.');
        return;
    }

    fdState = { power: power, deck: deck };

    let cardSrc;
    if (deck === 'invader') {
        cardSrc = `./assets/invader/${invaderSeq[invaderSeqIndex]}.jpg`;
    } else {
        cardSrc = `./assets/event/${eventSeq[eventSeqIndex]}.jpg`;
    }

    fdRevealedCard = { type: deck, src: cardSrc };
    fdShowPreview();
    save();
}

function fdShowPreview() {
    if (!fdRevealedCard) {
        $('#fd-preview-card').hide();
        $('#fd-actions').empty();
        return;
    }

    $('#fd-preview-card').attr('src', fdRevealedCard.src).show();

    if (fdState) {
        let actionsHtml;
        if (fdState.power === 'top') {
            actionsHtml = '<button class="btn btn-secondary special-action-btn" onclick="fdAct(\'shuffle\')">Shuffle with 2nd Card</button>';
        } else {
            actionsHtml =
                '<button class="btn btn-secondary special-action-btn" onclick="fdAct(\'keep\')">Keep on Top</button>' +
                '<button class="btn btn-secondary special-action-btn" onclick="fdAct(\'bottom\')">Move to Bottom</button>';
        }
        $('#fd-actions').html(actionsHtml);
    } else {
        $('#fd-actions').empty();
    }
}

function fdClearPreview() {
    fdRevealedCard = null;
    fdState = null;
    $('#fd-preview-card').hide();
    $('#fd-actions').empty();
}

function fdAct(action) {
    if (!fdState) return;

    if (fdState.deck === 'invader') {
        if (action === 'shuffle') {
            if (Math.random() >= 0.5) {
                let temp = invaderSeq[invaderSeqIndex];
                invaderSeq[invaderSeqIndex] = invaderSeq[invaderSeqIndex + 1];
                invaderSeq[invaderSeqIndex + 1] = temp;

                let tempLevel = invaderLevelSeq[invaderSeqIndex];
                invaderLevelSeq[invaderSeqIndex] = invaderLevelSeq[invaderSeqIndex + 1];
                invaderLevelSeq[invaderSeqIndex + 1] = tempLevel;
            }
        } else if (action === 'bottom') {
            let card = invaderSeq.splice(invaderSeqIndex, 1)[0];
            invaderSeq.push(card);
            let level = invaderLevelSeq.splice(invaderSeqIndex, 1)[0];
            invaderLevelSeq.push(level);
            invaderCards[3] = [invaderSeq[invaderSeqIndex]];
        }
    } else {
        if (action === 'shuffle') {
            if (Math.random() >= 0.5) {
                let temp = eventSeq[eventSeqIndex];
                eventSeq[eventSeqIndex] = eventSeq[eventSeqIndex + 1];
                eventSeq[eventSeqIndex + 1] = temp;
            }
        } else if (action === 'bottom') {
            let card = eventSeq.splice(eventSeqIndex, 1)[0];
            eventSeq.push(card);
        }
    }

    fdState = null;
    $('#fd-actions').empty();
    updateInvaderCard(false);
    updateUI();
    save();
}

// Open modal to select card to remove
function openRemoveCardModal(event) {
    // Store which card container this is for
    const $dropup = $(event.target).closest('.btn-group');
    currentInvaderCardContainer = $dropup.closest('.invader-card-area').find('.invader-card-container').attr('id');

    // Populate modal with current deck (only unflipped cards)
    const $selection = $('#invader-deck-selection');
    $selection.empty();

    let startIdx = invaderSeqIndex;

    if (!invaderSeq || startIdx >= invaderSeq.length) {
        $selection.html('<p class="text-muted">No cards in deck</p>');
    } else {
        for (let i = startIdx; i < invaderSeq.length; i++) {
            let code = invaderSeq[i];
            // Cards explicitly defined in level sequence show front face; random draws show back
            let isExplicit = isNaN(invaderLevelSeq[i]);
            let src = isExplicit ? `./assets/invader/${code}.jpg` : `./assets/invader/${codeToLevel(code)}.jpg`;

            let $wrapper = $('<div class="invader-deck-card-wrapper"></div>');
            $wrapper.append(`<img class="game-card game-card-invader invader-deck-card" src="${src}">`);
            (function(cardIndex) {
                $wrapper.on('click', function() {
                    removeCardFromDeck(cardIndex);
                    $('#remove-card-modal').modal('hide');
                });
            })(i);
            $selection.append($wrapper);
        }
    }

    // Show modal
    $('#remove-card-modal').modal('show');
}

// Remove selected card from deck
function removeCardFromDeck(cardIndex) {
    if (!invaderLevelSeq || cardIndex >= invaderLevelSeq.length) {
        alert('Invalid card selection');
        return;
    }
    
    invaderSeq.splice(cardIndex, 1);
    invaderLevelSeq.splice(cardIndex, 1);
    
    if (phase === 5 && exploreRevealed) {updateInvaderCard(true);} else {updateInvaderCard(false);}
    updateUI();
    save();
}

// Flip the top card of the invader deck
function flipTopInvaderCard(event) {
    
    // Check if there are cards in the invader deck
    if (invaderSeqIndex + 1 > invaderSeq.length) {
        alert('No cards left in Invader Deck to reveal. ');
        return;
    }

    if (phase !== 5) {
        alert('You can only do this during the Invader Actions Phase. ');
        return;
    }

    const topCard = invaderSeq[invaderSeqIndex];
    invaderCards[3].push(topCard);
    
    // Update the invader card display
    exploreRevealed = true;
    invaderSeqIndex++;
    updateInvaderCard(true);
    updateUI();
    save();
}

function resetInvaderCardActions() {
    invaderCardActions = {
            fourth: { lock: false, blight: false, event: false, fear: false },
            ravage: { lock: false, blight: false, event: false, fear: false },
            build: { lock: false, blight: false, event: false, fear: false },
            explore: { lock: false, blight: false, event: false, fear: false }
    }
    $('.btn-card-action').removeClass('active active-yellow');
}

function isValidCode(code) {
    if (code.length > 3) return false;
    if (code.length === 1) {
        if (isNaN(parseInt(code))) return false;
    }
    if (code.length === 2 || code.length === 3) {
        if (!isNaN(code[0]) && !level1.includes(code) && !level2.includes(code) && !level3.includes(code)) return false;
    }
    return true;
}

function codeToLevel(code) {
    if (isNaN(code[0])) return code;
    return parseInt(code[0]);
}

function codeToString(code) {
    let d = {
        1: 'I',
        2: 'II',
        3: 'III'
    }
    if (code.length === 1 && !isNaN(code)) {
        return `Stage ${d[code]}`;
    }
    stage = codeToLevel(code);
    if (isNaN(stage)) {
        stage = 0;
        terrain = code;
        return `${invaderCardDict[terrain]}`;
    } else {
        let terrain = '';
        for (let i = 1; i < code.length; i++) {
            terrain += (invaderCardDict[code[i]]);
        }
        return `Stage ${d[stage]} ${terrain}`.trim();
    }
}

// ===== Fear Deck System =====

function generateFearDeck(levelSeq) {
    let allCards = generateSeq('fear');
    let deck = [[], [], []];
    let idx = 0;
    for (let level = 0; level < 3; level++) {
        for (let i = 0; i < levelSeq[level]; i++) {
            if (idx < allCards.length) {
                deck[level].push(allCards[idx]);
                idx++;
            }
        }
    }
    return deck;
}

function earnFearCardFromDeck() {
    if (terrorLevel >= 3) {
        alert('Fear Victory! No more Fear Cards left.');
        return;
    }

    let card = fearDeck[terrorLevel][fearDeckIndex[terrorLevel]];
    let revealedKey = terrorLevel + '_' + fearDeckIndex[terrorLevel];
    let wasRevealed = !!fearRevealedCards[revealedKey];
    delete fearRevealedCards[revealedKey];
    fearEarnedQueue.push({ card: card, level: terrorLevel, revealed: wasRevealed });
    fearDeckIndex[terrorLevel]++;
    fearLevelSeq[terrorLevel]--;

    if (fearLevelSeq[terrorLevel] === 0) {
        terrorLevel++;
        updateTerrorLevel();
    }

    // Russia special effect
    if (adversary === 'russia' && adversaryLevel >= 5) {
        let russiaFearCount = 0;
        for (let i = 0; i < 3; i++) {
            russiaFearCount += getAdversaryConfig('fear')[i] - fearLevelSeq[i];
        }

        if (russiaFearCount === 3) {
            alert('Russia effect triggered: Entrench in the Face of Fear');
            let unusedLevel2 = level2.filter(function(item) { return !invaderSeq.includes(item); });
            invaderCards[2].push(unusedLevel2[Math.floor(Math.random() * unusedLevel2.length)]);
            updateInvaderCard(false);
            updateInvaderBadge();
        }
        if (russiaFearCount === 7) {
            alert('Russia effect triggered: Entrench in the Face of Fear');
            let unusedLevel3 = level3.filter(function(item) { return !invaderSeq.includes(item); });
            invaderCards[2].push(unusedLevel3[Math.floor(Math.random() * unusedLevel3.length)]);
            updateInvaderCard(false);
            updateInvaderBadge();
        }
    }

    earnedFearCards = fearEarnedQueue.length;
    updateUI();
}

function drawFearCardFromQueue() {
    if (fearEarnedQueue.length === 0) return null;
    let entry = fearEarnedQueue.shift();
    fearDiscardPile.push(entry.card);
    earnedFearCards = fearEarnedQueue.length;
    return entry.card;
}

// ===== Fear Deck Inline Renderer =====

function renderFearEarnedInline() {
    let $container = $('#fear-earned-inline');
    $container.empty();
    $container.toggleClass('show-gradient', fearEarnedQueue.length >= 3);
    if (fearEarnedQueue.length === 0) {
        $container.append('<div class="text-secondary d-flex align-items-center justify-content-center" style="font-size:1.2rem; font-style:italic; flex:1;">None</div>');
        return;
    }

    let $cards = $('<div class="fear-deck-card-row"></div>');
    for (let i = 0; i < fearEarnedQueue.length; i++) {
        let $card = $('<div class="fear-deck-card-wrapper"></div>').css('z-index', fearEarnedQueue.length - i);
        let earnedSrc = fearEarnedQueue[i].revealed ? `./assets/fear/${fearEarnedQueue[i].card}.jpg` : './assets/fear/back.jpg';
        $card.append(`<img class="game-card game-card-invader fear-deck-card" src="${earnedSrc}">`);
        (function(idx) {
            $card.on('click', function(e) { e.stopPropagation(); showFearCardActions(this, 'earned', idx); });
        })(i);
        $cards.append($card);
    }
    $container.append($cards);
}

function renderFearDeckInline() {
    let $container = $('#fear-deck-inline');
    $container.empty();

    // Terror level sections
    for (let level = 0; level < 3; level++) {
        if (fearDeckIndex[level] >= fearDeck[level].length) continue;

        let $section = $('<div class="fear-deck-level-section mb-2"></div>');

        let $cards = $('<div class="fear-deck-card-row"></div>');
        let deckCount = fearDeck[level].length - fearDeckIndex[level];

        // Background arrow label
        let goalLabel = level < 2 ? `Terror Level ${level + 2}` : 'Fear Victory';
        let arrowLabel = `${deckCount} card${deckCount !== 1 ? 's' : ''} until<br>${goalLabel}`;
        let $arrow = $(`<div class="fear-deck-level-arrow">${arrowLabel}</div>`);
        $section.append($arrow);
        for (let i = fearDeckIndex[level]; i < fearDeck[level].length; i++) {
            let cardId = fearDeck[level][i];
            let key = level + '_' + i;
            let isRevealed = fearRevealedCards[key];
            let src = isRevealed ? `./assets/fear/${cardId}.jpg` : './assets/fear/back.jpg';

            let $card = $('<div class="fear-deck-card-wrapper"></div>').css('z-index', deckCount - (i - fearDeckIndex[level]));
            $card.append(`<img class="game-card game-card-invader fear-deck-card" src="${src}">`);
            (function(l, idx) {
                $card.on('click', function(e) { e.stopPropagation(); showFearCardActions(this, 'deck', l, idx); });
            })(level, i);
            $cards.append($card);
        }
        // Add card button — appears at the left (top of deck)
        let $addBtn = $(`<div class="fear-deck-card-wrapper"></div>`).css('z-index', deckCount + 1);
        $addBtn.append(`<div class="fear-deck-add-btn" onclick="addCardToFearLevel(${level})" title="Add a card to Terror Level ${level + 1}">
                <i class="bi bi-plus-lg"></i>
            </div>`);
        $cards.prepend($addBtn);
        $section.append($cards);
        if (deckCount >= 5) $section.addClass('show-gradient');
        $container.append($section);

        let hasNextLevel = false;
        for (let nl = level + 1; nl < 3; nl++) {
            if (fearDeckIndex[nl] < fearDeck[nl].length) { hasNextLevel = true; break; }
        }
        if (hasNextLevel) $container.append('<hr class="my-1">');
    }


}

function renderCardHistories() {
    let $eventContainer = $('#card-history-event');
    let $fearContainer = $('#card-history-fear');
    $eventContainer.empty();
    $fearContainer.empty();
    $eventContainer.toggleClass('show-gradient', eventSeqIndex >= 3);
    $fearContainer.toggleClass('show-gradient', fearDiscardPile.length >= 3);

    // Event card history (most recent first)
    if (eventSeqIndex > 0) {
        let $cards = $('<div class="fear-deck-card-row"></div>');
        for (let i = eventSeqIndex - 1; i >= 0; i--) {
            let cardId = eventSeq[i];
            let $card = $('<div class="fear-deck-card-wrapper"></div>').css('z-index', i + 1);
            $card.append(`<img class="game-card game-card-invader fear-deck-card" src="./assets/event/${cardId}.jpg">`);
            (function(id) {
                $card.on('click', function(e) { e.stopPropagation(); displayCard('event', id); });
            })(cardId);
            $cards.append($card);
        }
        $eventContainer.append($cards);
    } else {
        $eventContainer.append('<div class="text-secondary d-flex align-items-center justify-content-center" style="font-size:1.2rem; font-style:italic; flex:1;">None</div>');
    }

    // Fear card history (most recent first, same as discard pile)
    if (fearDiscardPile.length > 0) {
        let $cards = $('<div class="fear-deck-card-row"></div>');
        for (let i = fearDiscardPile.length - 1; i >= 0; i--) {
            let cardId = fearDiscardPile[i];
            let $card = $('<div class="fear-deck-card-wrapper"></div>').css('z-index', i + 1);
            $card.append(`<img class="game-card game-card-invader fear-deck-card" src="./assets/fear/${cardId}.jpg">`);
            (function(id) {
                $card.on('click', function(e) { e.stopPropagation(); displayCard('fear', id); });
            })(cardId);
            $cards.append($card);
        }
        $fearContainer.append($cards);
    } else {
        $fearContainer.append('<div class="text-secondary d-flex align-items-center justify-content-center" style="font-size:1.2rem; font-style:italic; flex:1;">None</div>');
    }
}

function dismissFearCardPopover() {
    if (window.fearCardPopover) {
        let wrapper = window.fearCardPopoverWrapper;
        window.fearCardPopover.dispose();
        window.fearCardPopover = null;
        if (wrapper) $(wrapper).css('z-index', wrapper._oldZ || '');
        window.fearCardPopoverWrapper = null;
    }
}

function showFearCardActions(el, type, arg1, arg2) {
    dismissFearCardPopover();

    let actions = [];

    if (type === 'earned') {
        let index = arg1;
        let entry = fearEarnedQueue[index];
        if (entry.revealed) {
            displayCard('fear', entry.card);
            return;
        } else {
            actions.push({ label: 'Reveal', icon: 'bi-eye', btnClass: 'btn-primary', fn: function() {
                entry.revealed = true;
                displayCard('fear', entry.card);
                renderFearDeckInline();
                save();
            }});
        }
    } else if (type === 'deck') {
        let level = arg1, index = arg2;
        let key = level + '_' + index;
        let cardId = fearDeck[level][index];
        let isRevealed = fearRevealedCards[key];

        if (isRevealed) {
            actions.push({ label: 'View', icon: 'bi-eye', btnClass: 'btn-primary', fn: function() {
                displayCard('fear', cardId);
            }});
        } else {
            actions.push({ label: 'Reveal', icon: 'bi-eye', btnClass: 'btn-primary', fn: function() {
                fearRevealedCards[key] = true;
                displayCard('fear', cardId);
                renderFearDeckInline();
                save();
            }});
        }
        actions.push({ label: 'Remove', icon: 'bi-trash', btnClass: 'btn-danger', fn: function() {
            removeCardFromFearLevel(level, index);
        }});
    } else if (type === 'discard') {
        let index = arg1;
        let cardId = fearDiscardPile[index];
        actions.push({ label: 'View', icon: 'bi-eye', btnClass: 'btn-primary', fn: function() {
            displayCard('fear', cardId);
        }});
    }

    // Build popover content as DOM element
    let $content = $('<div class="btn-group-vertical w-100" role="group"></div>');
    actions.forEach(function(action) {
        let $btn = $(`<button class="btn ${action.btnClass} btn-sm">
            <i class="bi ${action.icon}"></i> ${action.label}
        </button>`);
        $btn.on('click', function(e) {
            e.stopPropagation();
            action.fn();
            dismissFearCardPopover();
        });
        $content.append($btn);
    });

    // Boost wrapper z-index so popover isn't hidden behind stacked cards
    let $wrapper = $(el);
    el._oldZ = $wrapper.css('z-index');
    $wrapper.css('z-index', 300);
    window.fearCardPopoverWrapper = el;

    // Create Bootstrap popover
    window.fearCardPopover = new bootstrap.Popover(el, {
        placement: 'top',
        html: true,
        content: $content[0],
        trigger: 'manual',
        container: 'body',
        popperConfig: function(defaultConfig) {
            var cardHeight = el.offsetHeight;
            var cardWidth = el.offsetWidth;
            defaultConfig.modifiers.push({
                name: 'offset',
                options: { offset: [0, -Math.round(cardHeight / 2)] }
            });
            defaultConfig.modifiers.push({
                name: 'sizeToCard',
                enabled: true,
                phase: 'beforeWrite',
                fn: function(data) {
                    data.state.styles.popper.width = cardWidth + 'px';
                    data.state.styles.popper.height = cardHeight + 'px';
                    data.state.styles.popper.transform += ' translateY(50%)';
                }
            });
            return defaultConfig;
        },
        template: '<div class="popover fear-card-bs-popover" role="tooltip"><div class="popover-body"></div></div>'
    });
    window.fearCardPopover.show();

    // Dismiss on outside click
    setTimeout(function() {
        $(document).one('click', function() {
            dismissFearCardPopover();
        });
    }, 0);
}

function removeCardFromFearLevel(level, index) {
    fearDeck[level].splice(index, 1);
    // Adjust fearDeckIndex if needed
    if (index < fearDeckIndex[level]) {
        fearDeckIndex[level]--;
    }
    fearLevelSeq[level] = fearDeck[level].length - fearDeckIndex[level];

    // Clean up revealed cards keys for this level (indices shifted)
    let newRevealed = {};
    for (let k in fearRevealedCards) {
        let parts = k.split('_');
        let l = parseInt(parts[0]);
        let idx = parseInt(parts[1]);
        if (l === level) {
            if (idx < index) {
                newRevealed[k] = fearRevealedCards[k];
            } else if (idx > index) {
                newRevealed[l + '_' + (idx - 1)] = fearRevealedCards[k];
            }
            // idx === index: removed, skip
        } else {
            newRevealed[k] = fearRevealedCards[k];
        }
    }
    fearRevealedCards = newRevealed;

    if (fearLevelSeq[level] === 0 && terrorLevel === level) {
        terrorLevel++;
        updateTerrorLevel();
    }

    updateUI();
    renderFearDeckInline(); // Refresh
    save();
}

function addCardToFearLevel(level) {
    // Pick a random unused fear card (not already in any level of the deck, queue, or discard)
    let usedCards = [];
    for (let l = 0; l < 3; l++) {
        usedCards = usedCards.concat(fearDeck[l]);
    }
    usedCards = usedCards.concat(fearDiscardPile);
    usedCards = usedCards.concat(fearEarnedQueue.map(e => e.card));

    let allFearCards = generateSeq('fear');
    let available = allFearCards.filter(c => !usedCards.includes(c));

    if (available.length === 0) {
        alert('No unused fear cards available to add.');
        return;
    }

    let card = available[Math.floor(Math.random() * available.length)];
    // Insert at top of remaining cards (at fearDeckIndex position)
    fearDeck[level].splice(fearDeckIndex[level], 0, card);
    fearLevelSeq[level]++;

    // Shift revealed card keys for this level
    let newRevealed = {};
    for (let k in fearRevealedCards) {
        let parts = k.split('_');
        let l = parseInt(parts[0]);
        let idx = parseInt(parts[1]);
        if (l === level && idx >= fearDeckIndex[level]) {
            newRevealed[l + '_' + (idx + 1)] = fearRevealedCards[k];
        } else {
            newRevealed[k] = fearRevealedCards[k];
        }
    }
    fearRevealedCards = newRevealed;

    updateUI();
    renderFearDeckInline(); // Refresh
    save();
}

// ===== Invader Discard Modal =====

function openInvaderDiscardModal() {
    let $body = $('#invader-discard-modal-body');
    $body.empty();

    if (invaderDiscardPile.length === 0) {
        $body.html('<p class="text-muted text-center">No discarded invader cards yet.</p>');
    } else {
        let $cards = $('<div class="invader-discard-card-row"></div>');
        for (let i = 0; i < invaderDiscardPile.length; i++) {
            $cards.append(generateInvaderCard(invaderDiscardPile[i]));
        }
        $body.append($cards);
    }

    $('#invader-discard-modal').modal('show');
}

