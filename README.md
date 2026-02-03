# Spirit Island Tracker

**Access the tool at [https://lndrchan.github.io/spirit-island-tracker/](https://lndrchan.github.io/spirit-island-tracker/)**

Welcome to Spirit Island Tracker. This is a web app that simulates an automated Invader Board for the board game Spirit Island, to reduce the amount of setup needed when playing. 

This is a personal project and is only meant to complement the board game rather than replacing it altogether. I will try my best to respond to any feedback and suggestions. However, since I am new to web programming, I may not be able to implement all of the requests. 

# How to Use

- You only need to set up the board game with the following components as usual: 
    - Spirit components: Boards, Power Cards and Tokens (Energy, and any associated pieces if applicable)
    - Island Boards and Tokens (Invader pieces)
    - **Skip drawing the Blight Card but keep the Blight Pool as if they were placed on the Card**. This tool will track the Blight Card drawn throughout the game while you will need physical Blight tokens to add onto the board. 
- You do **not** need to set up the following: 
    - Fear Deck and Terror Level indicator
    - Event Deck
    - Invader Deck
    - Adversary Card (if using)
- The Tracker will start on the first Invader Phase to allow you to set up the Island Boards.
- After each phase, press 'Next Step' to advance to the next phase.
- Make sure to read the [Compatibility](#Compatibility) section to see what this tool can and cannot do for your game. 

# Compatibility

- This tool explicitly supports the following Event Cards:
    - Far-Off Wars Touch the Island
    - Terror Spikes Upwards
    - I may have missed some Event Cards that are resolved by changing the Invader Board. In those cases, use the 'Redraw' button and consider letting me know via the 'Credits & Feedback' menu. 
- This tool supports all adversaries and their special rules.
    - Namely, England High Immigration Tile, France 'Slave Rebellion' Event, Russia 'Entrench in the Face of Fear' Effect
    - However, Supporting Adversaries (combinations) are **not** supported. 
- All Spirits are supported. However, some of them need **Special Actions** with this tool to resolve their effects: 
    - Bringer of Dreams and Nightmares: **Spirits May Yet Dream**
    - Fractured Days Split the Sky: **Visions of a Shifting Future**
- Use Scenarios at your own discretion. Support for specific Scenarios will be considered, but not guaranteed.
- Vertical screens and small screens are **not** supported. Please use a sufficiently sized horizontal screen (laptops, tablets etc.) and adjust text size as needed. 
---
**If you would like to see a feature added or report a broken feature, please consider sending feedback with the 'Issues' tab on Github or 'Bug Reports and Feature Suggestions' button under the 'Credits and Feedback' menu.**

# Features

### Turn Tracking
Turns are automatically tracked and advanced with a single button press. The indicator pane updates depending on what phase is coming next, including dynamically displayed invader actions and adversary-specific actions. 

### Fear Tracking
No more being confused between earned fear tokens and fear pool tokens. Fears are now generated with a single button! Amount of fear tokens earned and fear cards earned are dynamically displayed on the left pane, and resolved when the turn tracker reaches the fear card phase. 

### Card Drawing
Shuffled fear decks or event decks for a setup just to lose to England 6 after 10 minutes? Not to worry! With Spirit Island Tracker, fear cards and event cards are automatically drawn when the corresponding phases have been reached. Also includes an option to redraw if you encounter a card not currently supported by the tool, or if you just want to cheat a little bit. 

# Credits

Created by lndrchan (Leander). Please consider [buying me a coffee](https://ko-fi.com/lndr0) if you have enjoyed using this tool. 

---

Spirit Island is a board game by R. Eric Reuss, published by Greater Than Games, LLC. 

Spirit Island Tracker is an unofficial tool and is not affiliated with Spirit Island's publisher or author in any way. 
