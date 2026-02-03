const adversaryNameDict = {
    'none': 'None',
    'prussia': 'Brandenburg-Prussia',
    'england': 'England',
    'sweden': 'Sweden',
    'france': 'France',
    'habsburg-livestock': 'Habsburg (Livestock)',
    'scotland': 'Scotland',
    'russia': 'Russia',
    'habsburg-mining': 'Habsburg (Mining Expedition)'
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

const invaderCardDict = {
    'w': 'Wetland',
    's': 'Sand',
    'j': 'Jungle',
    'm': 'Mountain',
    'c': 'Coast',
    'ss': 'Salt'
}

const adversaryConfig = {

    'none': {
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
            [1,1,2,2,1,'2c',3,3,3,3,3],
            [],
            [1,1,2,2,3,'2c',3,3,3,3],
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