function range(start, end) {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
}

const expansionCards = {
    'bc': {
        'fear': range(1, 15),
        'event': [...range(2, 21), 52, 53],
        'blight': range(3, 8)
    },
    'ff': {
        'fear': range(37, 41),
        'event': [],
        'blight': []
    },
    'je': {
        'fear': range(31, 36),
        'event': range(22, 51),
        'blight': range(9, 15)
    },
    'ni': {
        'fear': range(42, 50),
        'event': range(54, 62),
        'blight': range(16, 23)
    }
}

const adversaryNameDict = {
    'none': 'None',
    'prussia': 'Brandenburg-Prussia',
    'england': 'England',
    'sweden': 'Sweden',
    'france': 'France',
    'habsburg-livestock': 'Habsburg Monarchy',
    'scotland': 'Scotland',
    'russia': 'Russia',
    'habsburg-mining': 'Habsburg Mining Expedition'
}

const adversaryFlagDict = {
    'none': '',
    'prussia': '(B-P)',
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'sweden': '🇸🇪',
    'france': '(FR)',
    'habsburg-livestock': '(HA)',
    'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'russia': '(RU)',
    'habsburg-mining': '(HME)'
}

const adversaryIntroText = {
    'none': '',
    'prussia': `
        <p>Excellent first Adversary with few new rules; most of the changes occur during game Setup. </p>
        <p>Speed is the name of the game: the Invaders do everything at a faster tempo. Cards with 2 land types come up much earlier, often before the Spirits have had time to prepare. </p>
        <p>This Adversary is notably harder for Spirits which need substantial time to develop. </p>
    `,
    'england': `
        <p>Buildings, buildings, and more buildings - England sends so many immigrants that the colonies spill over into unexplored lands. It doesn’t start out fast, but constantly pushes its borders forward. They will push hard to found a capital during Stage II. </p>
        <p>This Adversary is notably easier for Spirits good at wrecking Towns (e.g. Lightning’s Swift Strike). </p>
        <p>This Adversary is notably harder for Spirits which rely on moving/killing Explorers to prevent Invader Builds (e.g. Shadows Flicker Like Flame). </p>
    `,
    'sweden': `
        <p>Sweden’s Ravages are more dangerous than most, with advanced military tactics and a large population interested in farming and mining. The Crown’s policies favor assimilating the Dahan where possible, though these efforts will only work where Invader population is large. </p>
        <p>This Adversary is notably easier for Spirits which can prevent Ravages (e.g. A Spread of Rampant Green or Vital Strength of the Earth). </p>
        <p>A Note Regarding Setup: The Kingdom of Sweden can add Blight during Setup. Blight added during Setup does not cascade or Destroy Spirit Presence. </p>
    `,
    'france': `
        <p>This Adversary is notably easier for Spirits which are good at destroying Towns (e.g., Lightning Swift Strike).</p>
        <p>This Adversary is notably harder for Spirits which have difficulty destroying buildings (e.g., Bringer of Dreams and Nightmares), due to the additional loss condition.</p>
    `,
    'habsburg-livestock': `
        <p>This Adversary is notably easier for Spirits that tend to let lots of Blight get added (e.g., Vengeance as a Burning Plague) or for Spirits that can Isolate lands (e.g., Downpour Drenches the World).</p>
        <p>This Adversary is notably harder for Spirits that are hamstrung by Blight (e.g., Sharp Fangs Behind the Leaves) or with Scenarios that involve keeping the Invaders from reaching a given place.
    `,
    'scotland': `
        <p>This Adversary is notably easier for Spirits that can outright skip Invader actions.</p>
        <p>This Adversary is notably harder for Spirits that have a hard time stopping Coastal Cities from being Built (e.g., Shroud of Silent Mist).</p>
        <p>This Adversary is very swingy on Board D, due to the double coastal Wetland.</p>
    `,
    'russia': `
        <p>This Adversary is notably easier for Spirits that can prevent Explorers from entering the game (e.g., Keeper of the Forbidden Wilds), or for Spirits with good Explorer control and “each Invader” Damage (e.g., River Surges in Sunlight).</p>
        <p>This Adversary is notably harder for Spirits that have a hard time controlling Explorers.</p>
    `,
    'habsburg-mining': `
        <p>This Adversary is notably easier for Spirits that are good at preventing Explore Actions (e.g., Keeper of the Forbidden Wilds) or destroying multiple Explorers (e.g., Lure of the Deep Wilderness).</p>
        <p>This Adversary is notably harder for Spirits that have difficulty destroying large groups of Invaders (e.g., Finder of Paths Unseen) or handling lots of Ravage Actions (e.g., Heart of the Wildfire). </p>
    `
}

const invaderCardDict = {
    'w': 'Wetland',
    's': 'Sand',
    'j': 'Jungle',
    'm': 'Mountain',
    'c': 'Coast',
    'ss': 'Salt'
}

// Per-adversary level-row geometry for the level-darkening overlay.
// `tops` are the y-positions (as % of card height from the top) of the TOP edge of each
// level row 1..6. The overlay darkens from tops[selectedLevel] down to the bottom of the
// card (the higher levels that are not in play). `bottom` is the detected bottom of the
// level table (kept for reference; the shading itself extends past it to the card edge).
// Values are auto-detected from the brown horizontal divider lines printed on each card
// via tools/detect_boundaries.py --js, so they match each card's actual layout (which
// differs per adversary, since level effect text varies in length).
const adversaryLevelBoundaries = {
    'prussia': { tops: [25.0, 38.6, 50.9, 60.5, 72.7, 85.6], bottom: 97.4 },
    'england': { tops: [25.1, 39.0, 48.5, 68.0, 74.2, 80.2], bottom: 97.2 },
    'sweden': { tops: [25.1, 43.2, 52.3, 58.8, 71.8, 81.8], bottom: 97.2 },
    'france': { tops: [25.1, 39.7, 52.7, 61.6, 71.0, 84.3], bottom: 97.2 },
    'habsburg-livestock': { tops: [26.0, 40.4, 53.0, 62.6, 75.2, 87.7], bottom: 97.3 },
    'russia': { tops: [26.0, 45.7, 54.7, 64.0, 72.7, 85.6], bottom: 97.3 },
    'scotland': { tops: [25.7, 42.5, 54.7, 64.0, 72.7, 85.6], bottom: 97.3 },
    'habsburg-mining': { tops: [26.3, 50.1, 59.2, 68.2, 80.1, 89.1], bottom: 97.4 },
};

const adversaryConfig = {

    'none': {
        'difficulty': [
            0,0,0,0,0,0,0
        ],
        'fear': [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        'invader': [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        'actionChange': [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },

    'prussia': {
        'difficulty': [
            1,2,4,6,7,9,10
        ],
        'fear': [
            [],
            [],
            [],
            [3,4,3],
            [4,4,3],
            [4,4,3],
            [4,4,4]
        ],
        'invader': [
            [],
            [1,1,1,2,2,2,2,3,3,3,3,3],
            [1,1,1,3,2,2,2,2,3,3,3,3],
            [1,1,3,2,2,2,2,3,3,3,3],
            [1,1,3,2,2,2,3,3,3,3],
            [1,3,2,2,2,3,3,3,3],
            [3,2,2,2,3,3,3,3]
        ],
        'actionChange': [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
    },

    'england': {
        'difficulty': [
            1,3,4,6,7,9,11
        ],
        'fear': [
            [],
            [3,4,3],
            [4,4,3],
            [4,5,4],
            [4,5,5],
            [],
            [4,5,4]
        ],
        'invader': [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        'actionChange': [
            [],
            [2],
            [2],
            [2],
            [2],
            [2],
            [2]
        ]
    },

    'sweden': {
        'difficulty': [
            1,2,3,5,6,7,8
        ],
        'fear': [
            [],
            [],
            [3,4,3],
            [3,4,3],
            [3,4,4],
            [4,4,4],
            [4,4,5]
        ],
        'invader': [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        'actionChange': [
            [],
            [1],
            [1],
            [1],
            [1],
            [1],
            [1]
        ]
    },

    'france': {
        'difficulty': [
            2,3,5,7,8,9,10
        ],
        'fear': [
            [],
            [],
            [3,4,3],
            [4,4,3],
            [4,4,4],
            [4,5,4],
            [4,5,5]
        ],
        'invader': [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        'actionChange': [
            [],
            [3],
            [2,3],
            [2,3],
            [2,3],
            [2,3],
            [2,3]
        ]
    },

    'habsburg-livestock': {
        'difficulty': [
            2,3,5,6,8,9,10
        ],
        'fear': [
            [],
            [3,4,3],
            [4,5,2],
            [4,5,3],
            [],
            [4,6,3],
            [5,6,3]
        ],
        'invader': [
            [],
            [],
            [1,1,2,2,2,2,3,3,3,3,3],
            [],
            [],
            [],
            []
        ],
        'actionChange': [
            [],
            [2],
            [2],
            [2],
            [2],
            [2,3],
            [1,2,3]
        ]
    },

    'russia': {
        'difficulty': [
            1,3,4,6,7,9,11
        ],
        'fear': [
            [],
            [3,3,4],
            [4,3,4],
            [4,4,3],
            [4,4,4],
            [4,5,4],
            [5,5,4]
        ],
        'invader': [
            [],
            [],
            [],
            [],
            [1,1,1,2,3,2,3,2,3,2,3,3],
            [],
            []
        ],
        'actionChange': [
            [],
            [1],
            [1],
            [1],
            [1],
            [1],
            [1]
        ]
    },

    'scotland': {
        'difficulty': [
            1,3,4,6,7,8,10
        ],
        'fear': [
            [],
            [3,4,3],
            [4,4,3],
            [4,5,4],
            [5,5,4],
            [5,6,4],
            [6,6,4]
        ],
        'invader': [
            [],
            [],
            [1,1,2,2,1,'2c',2,3,3,3,3,3],
            [],
            [1,1,2,2,3,'2c',2,3,3,3,3],
            [],
            []
        ],
        'actionChange': [
            [],
            [3],
            [3],
            [2,3],
            [2,3],
            [1,2,3],
            [1,2,3]
        ]
    },

    'habsburg-mining': {
        'difficulty': [
            2,3,4,5,7,9,10
        ],
        'fear': [
            [],
            [],
            [3,3,4],
            [3,4,4],
            [4,4,4],
            [4,5,4],
            []
        ],
        'invader': [
            [],
            [],
            [],
            [],
            [1,1,1,2,'ss',2,2,3,3,3,3,3],
            [],
            []
        ],
        'actionChange': [
            [],
            [1,2],
            [1,2],
            [1,2],
            [1,2],
            [1,2],
            [1,2,3]
        ]
    },
}
