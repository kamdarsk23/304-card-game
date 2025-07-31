class Game304 {
    constructor() {
        this.players = {
            1: { name: '', hand: [], score: 0, bid: null, tricks: 0, roundPoints: 0, canDeclare: false, declarations: [] },
            2: { name: '', hand: [], score: 0, bid: null, tricks: 0, roundPoints: 0, canDeclare: false, declarations: [] },
            3: { name: '', hand: [], score: 0, bid: null, tricks: 0, roundPoints: 0, canDeclare: false, declarations: [] }
        };
        this.currentPlayer = 1;
        this.gameState = 'naming'; // naming, bidding, trump, playing, finished
        this.deck = [];
        this.currentBid = 0;
        this.currentBidder = null;
        this.biddingOrder = [1, 2, 3];
        this.currentBiddingIndex = 0;
        this.passedPlayers = new Set(); // Track who has passed
        this.activeBidders = [1, 2, 3]; // Players still in bidding
        this.trumpSuit = null;
        this.speakingPlayer = null;
        this.dealer = 1;
        this.currentTrick = [];
        this.trickSuit = null;
        this.currentPlayerTurn = null;
        this.tricksPlayed = 0;
        this.bidTarget = 0; // Adjusted bid target after declarations
        
        this.cardValues = {
            '9': 20, '10': 10, 'J': 30, 'Q': 2, 'K': 3, 'A': 11
        };
        
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.ranks = ['9', '10', 'J', 'Q', 'K', 'A'];
        
        this.initializeDeck();
    }

    initializeDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                this.deck.push({
                    suit: suit,
                    rank: rank,
                    value: this.cardValues[rank],
                    id: `${rank}_${suit}`
                });
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealInitialCards() {
        this.shuffleDeck();
        let deckIndex = 0;
        
        // Deal 4 cards to each player
        for (let round = 0; round < 4; round++) {
            for (let playerId = 1; playerId <= 3; playerId++) {
                this.players[playerId].hand.push(this.deck[deckIndex++]);
            }
        }
        
        // Store remaining cards for second deal
        this.remainingDeck = this.deck.slice(deckIndex);
    }

    dealRemainingCards() {
        let deckIndex = 0;
        
        // Deal remaining 4 cards to each player
        for (let round = 0; round < 4; round++) {
            for (let playerId = 1; playerId <= 3; playerId++) {
                this.players[playerId].hand.push(this.remainingDeck[deckIndex++]);
            }
        }
    }

    startBidding() {
        this.currentBiddingIndex = 0;
        this.currentBid = 0;
        this.currentBidder = null;
        this.passedPlayers = new Set();
        this.activeBidders = [1, 2, 3];
        this.gameState = 'bidding';
        this.currentPlayer = this.biddingOrder[0];
        
        logMessage(`Bidding starts with ${this.players[this.currentPlayer].name}`);
    }

    getCardPower(card, trumpSuit, trickSuit) {
        if (card.suit === trumpSuit) return 1000 + this.cardValues[card.rank];
        if (card.suit === trickSuit) return 100 + this.cardValues[card.rank];
        return this.cardValues[card.rank];
    }

    isValidPlay(card, playerHand, trickSuit, trumpSuit) {
        if (!trickSuit) return true;
        
        const hasTrickSuit = playerHand.some(c => c.suit === trickSuit);
        if (hasTrickSuit && card.suit !== trickSuit) {
            return card.suit === trumpSuit;
        }
        
        return true;
    }

    findKingQueenPairs(playerHand, playerId) {
        const pairs = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const playerDeclarations = this.players[playerId].declarations;
        
        for (let suit of suits) {
            // Check if this player has already declared this suit
            const alreadyDeclared = playerDeclarations.some(d => d.suit === suit);
            if (alreadyDeclared) continue;
            
            const hasKing = playerHand.some(c => c.rank === 'K' && c.suit === suit);
            const hasQueen = playerHand.some(c => c.rank === 'Q' && c.suit === suit);
            
            if (hasKing && hasQueen) {
                pairs.push({
                    suit: suit,
                    value: suit === this.trumpSuit ? 40 : 20
                });
            }
        }
        
        return pairs;
    }

    sortHand(hand) {
        // Define suit order: spades, hearts, diamonds, clubs
        const suitOrder = { 'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3 };
        // Define rank order: Q, K, 10, A, 9, J
        const rankOrder = { 'Q': 0, 'K': 1, '10': 2, 'A': 3, '9': 4, 'J': 5 };
        
        return hand.sort((a, b) => {
            // First sort by suit
            const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
            if (suitDiff !== 0) return suitDiff;
            
            // Then sort by rank within the same suit
            return rankOrder[a.rank] - rankOrder[b.rank];
        });
    }
}

let game = new Game304();

// Name entry functions
function setPlayerName() {
    const input = document.getElementById('playerNameInput');
    const name = input.value.trim();
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    game.players[game.currentPlayer].name = name;
    logMessage(`${name} joined as Player ${game.currentPlayer}`);
    
    input.value = '';
    
    if (game.currentPlayer < 3) {
        game.currentPlayer++;
        updateNameEntry();
    } else {
        finishNaming();
    }
}

function updateNameEntry() {
    document.getElementById('currentPlayerName').textContent = game.currentPlayer;
    document.getElementById('playerNameInput').placeholder = `Enter name for Player ${game.currentPlayer}`;
    
    let enteredNames = '';
    for (let i = 1; i <= 3; i++) {
        if (game.players[i].name) {
            enteredNames += `Player ${i}: ${game.players[i].name}\n`;
        }
    }
    document.getElementById('enteredNames').textContent = enteredNames;
}

function finishNaming() {
    game.currentPlayer = 1;
    
    // Show final player list
    let playerList = '';
    for (let i = 1; i <= 3; i++) {
        playerList += `Player ${i}: ${game.players[i].name}\n`;
    }
    document.getElementById('finalPlayerList').textContent = playerList;
    
    // Switch to ready screen
    document.getElementById('nameEntry').classList.add('hidden');
    document.getElementById('readyScreen').classList.remove('hidden');
    
    logMessage("All players ready!");
}

// Game functions
function dealCardsAndStart() {
    // Reset for new round
    Object.values(game.players).forEach(p => {
        p.hand = [];
        p.bid = null;
        p.tricks = 0;
        p.roundPoints = 0;
        p.canDeclare = false;
        p.declarations = [];
    });
    
    game.currentTrick = [];
    game.trickSuit = null;
    game.trumpSuit = null;
    game.tricksPlayed = 0;
    game.currentBid = 0;
    game.currentBidder = null;
    game.currentBiddingIndex = 0;
    game.speakingPlayer = null;
    game.currentPlayerTurn = null;
    game.passedPlayers = new Set();
    game.activeBidders = [1, 2, 3];
    game.bidTarget = 0;
    
    game.dealInitialCards();
    game.startBidding();
    
    // Show turn screen
    showTurnScreen();
    
    logMessage("Cards dealt! Bidding phase begins.");
}

function showTurnScreen() {
    // Hide all other screens
    document.getElementById('readyScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    
    // Show turn screen
    const playerName = game.players[game.currentPlayer].name;
    document.getElementById('currentTurnPlayer').textContent = `${playerName}'s Turn`;
    document.getElementById('confirmPlayerName').textContent = playerName;
    document.getElementById('turnScreen').classList.remove('hidden');
}

function enterTurn() {
    // Switch to game screen
    document.getElementById('turnScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    updateDisplay();
}

function updateDisplay() {
    // Update scores and round points
    document.getElementById('score1').textContent = game.players[1].score;
    document.getElementById('score2').textContent = game.players[2].score;
    document.getElementById('score3').textContent = game.players[3].score;
    document.getElementById('points1').textContent = game.players[1].roundPoints;
    document.getElementById('points2').textContent = game.players[2].roundPoints;
    document.getElementById('points3').textContent = game.players[3].roundPoints;
    
    // Update current player display
    const playerName = game.players[game.currentPlayer].name || `Player ${game.currentPlayer}`;
    document.getElementById('currentPlayer').textContent = playerName;
    
    // Update game phase
    let phaseText = '';
    switch(game.gameState) {
        case 'bidding':
            phaseText = `Make your bid`;
            break;
        case 'trump':
            phaseText = `Select Trump Suit`;
            break;
        case 'declaration':
            phaseText = `Declare King-Queen pairs`;
            break;
        case 'playing':
            phaseText = `Play a card`;
            break;
        default:
            phaseText = 'Your turn';
    }
    document.getElementById('gamePhase').textContent = phaseText;
    
    // Show/hide UI elements
    const biddingArea = document.getElementById('biddingArea');
    const trumpSelection = document.getElementById('trumpSelection');
    const declarationArea = document.getElementById('declarationArea');
    
    biddingArea.classList.toggle('hidden', game.gameState !== 'bidding');
    trumpSelection.classList.toggle('hidden', game.gameState !== 'trump');
    declarationArea.classList.toggle('hidden', game.gameState !== 'declaration');
    
    // Update bidding display
    if (game.gameState === 'bidding') {
        document.getElementById('currentBid').textContent = game.currentBid;
        document.getElementById('currentBidder').textContent = game.currentBidder ? game.players[game.currentBidder].name : 'None';
    }
    
    // Update trump display
    document.getElementById('trumpSuit').textContent = game.trumpSuit ? getSuitSymbol(game.trumpSuit) : 'None';
    
    // Update bid target display
    const bidTargetDisplay = document.getElementById('bidTargetDisplay');
    if (game.speakingPlayer && game.bidTarget > 0) {
        bidTargetDisplay.textContent = `${game.players[game.speakingPlayer].name} needs ${game.bidTarget} points (bid: ${game.currentBid})`;
    } else {
        bidTargetDisplay.textContent = '';
    }
    
    // Update declarations display
    if (game.gameState === 'declaration') {
        displayAvailableDeclarations();
    }
    
    displayHand();
    displayPlayedCards();
}

function displayHand() {
    const handContainer = document.getElementById('hand');
    handContainer.innerHTML = '';
    
    const playerHand = game.players[game.currentPlayer].hand;
    
    if (playerHand.length === 0) {
        handContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #ccc;">No cards yet</div>';
        return;
    }
    
    // Sort cards by suit and rank
    const sortedHand = game.sortHand([...playerHand]);
    
    sortedHand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.suit}`;
        cardElement.innerHTML = `
            <div class="value">${card.rank}</div>
            <div class="suit">${getSuitSymbol(card.suit)}</div>
        `;
        
        // Make card playable if it's player's turn
        if (game.gameState === 'playing' && game.currentPlayerTurn === game.currentPlayer) {
            if (game.isValidPlay(card, playerHand, game.trickSuit, game.trumpSuit)) {
                cardElement.classList.add('playable');
                cardElement.onclick = () => playCard(card);
            }
        }
        
        handContainer.appendChild(cardElement);
    });
}

function displayPlayedCards() {
    const slots = ['slot1', 'slot2', 'slot3'];
    
    slots.forEach(slotId => {
        document.getElementById(slotId).innerHTML = '';
    });
    
    game.currentTrick.forEach((play, index) => {
        const slot = document.getElementById(slots[index]);
        slot.innerHTML = `
            <div class="card ${play.card.suit}">
                <div class="value">${play.card.rank}</div>
                <div class="suit">${getSuitSymbol(play.card.suit)}</div>
            </div>
            <div style="font-size: 0.8rem; margin-top: 5px;">${game.players[play.player].name}</div>
        `;
    });
}

function getSuitSymbol(suit) {
    const symbols = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    };
    return symbols[suit];
}

function displayAvailableDeclarations() {
    const container = document.getElementById('availableDeclarations');
    const availableDeclarations = game.findKingQueenPairs(game.players[game.currentPlayer].hand, game.currentPlayer);
    
    container.innerHTML = '';
    
    if (availableDeclarations.length === 0) {
        container.innerHTML = '<p>No King-Queen pairs available to declare.</p>';
        return;
    }
    
    availableDeclarations.forEach(decl => {
        const declButton = document.createElement('button');
        declButton.innerHTML = `Declare K-Q of ${getSuitSymbol(decl.suit)} (${decl.value} points)`;
        declButton.style.cssText = `
            padding: 10px 20px; 
            margin: 5px; 
            font-size: 1.1em; 
            background: ${decl.suit === game.trumpSuit ? '#ffd700' : '#28a745'}; 
            color: ${decl.suit === game.trumpSuit ? '#000' : 'white'}; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer;
        `;
        declButton.onclick = () => makeDeclaration(decl.suit);
        container.appendChild(declButton);
    });
}

function makeDeclaration(suit) {
    const currentPlayer = game.currentPlayer;
    const declarationValue = suit === game.trumpSuit ? 40 : 20;
    
    // Add to player's declarations
    game.players[currentPlayer].declarations.push({ suit, value: declarationValue });
    
    // Adjust bid target based on whether speaker or opponent is declaring
    if (currentPlayer === game.speakingPlayer) {
        // Speaker declares - reduces their target
        game.bidTarget -= declarationValue;
        logMessage(`${game.players[currentPlayer].name} declares K-Q of ${getSuitSymbol(suit)} (-${declarationValue} points from bid target)`);
    } else {
        // Opponent declares - increases speaker's target
        game.bidTarget += declarationValue;
        logMessage(`${game.players[currentPlayer].name} declares K-Q of ${getSuitSymbol(suit)} (+${declarationValue} points to bid target)`);
    }
    
    // Continue with next trick
    game.gameState = 'playing';
    showTurnScreen();
}

function skipDeclaration() {
    logMessage(`${game.players[game.currentPlayer].name} skips declaration`);
    game.gameState = 'playing';
    showTurnScreen();
}

function endTurn() {
    // Go back to turn screen for next player
    showTurnScreen();
}

function makeBid() {
    const bidInput = document.getElementById('bidInput');
    const bidAmount = parseInt(bidInput.value);
    
    if (!bidAmount || bidAmount <= game.currentBid) {
        alert('Bid must be higher than current bid');
        return;
    }
    
    if (bidAmount > 304) {
        alert('Bid cannot exceed 304');
        return;
    }
    
    const currentPlayer = game.currentPlayer;
    game.currentBid = bidAmount;
    game.currentBidder = currentPlayer;
    game.players[currentPlayer].bid = bidAmount;
    
    // Reset passes when someone makes a new bid
    game.passedPlayers.clear();
    
    logMessage(`${game.players[currentPlayer].name} bids ${bidAmount}`);
    
    bidInput.value = '';
    nextBiddingTurn();
}

function pass() {
    const currentPlayer = game.currentPlayer;
    game.passedPlayers.add(currentPlayer);
    
    logMessage(`${game.players[currentPlayer].name} passes`);
    nextBiddingTurn();
}

function nextBiddingTurn() {
    // Check if bidding is over (only 1 active bidder left, or all passed)
    const activeBidders = game.activeBidders.filter(p => !game.passedPlayers.has(p));
    
    if (activeBidders.length <= 1) {
        // Bidding is over
        if (game.currentBidder) {
            game.speakingPlayer = game.currentBidder;
            game.gameState = 'trump';
            game.currentPlayer = game.speakingPlayer;
            game.bidTarget = game.currentBid; // Initialize bid target
            logMessage(`${game.players[game.speakingPlayer].name} won the bidding with ${game.currentBid}`);
        } else {
            // All passed, dealer must speak
            game.speakingPlayer = game.dealer;
            game.currentBid = 1;
            game.gameState = 'trump';
            game.currentPlayer = game.speakingPlayer;
            game.bidTarget = 1; // Initialize bid target
            logMessage(`All players passed. ${game.players[game.speakingPlayer].name} (dealer) must speak.`);
        }
        showTurnScreen();
        return;
    }
    
    // Continue bidding - find next active player
    do {
        game.currentBiddingIndex = (game.currentBiddingIndex + 1) % game.biddingOrder.length;
        game.currentPlayer = game.biddingOrder[game.currentBiddingIndex];
    } while (game.passedPlayers.has(game.currentPlayer));
    
    showTurnScreen();
}

function selectTrump(suit) {
    if (game.speakingPlayer === game.currentPlayer) {
        game.trumpSuit = suit;
        game.dealRemainingCards();
        game.gameState = 'playing';
        game.currentPlayer = game.speakingPlayer;
        game.currentPlayerTurn = game.speakingPlayer;
        
        logMessage(`${game.players[game.speakingPlayer].name} selected ${getSuitSymbol(suit)} as trump`);
        logMessage("Remaining cards dealt. Game begins!");
        
        showTurnScreen();
    }
}

function playCard(card) {
    if (game.currentPlayerTurn !== game.currentPlayer) return;
    
    // Remove card from player's hand
    const playerHand = game.players[game.currentPlayer].hand;
    const cardIndex = playerHand.findIndex(c => c.id === card.id);
    playerHand.splice(cardIndex, 1);
    
    // Add to current trick
    game.currentTrick.push({
        player: game.currentPlayer,
        card: card
    });
    
    // Set trick suit if first card
    if (game.currentTrick.length === 1) {
        game.trickSuit = card.suit;
    }
    
    logMessage(`${game.players[game.currentPlayer].name} plays ${card.rank}${getSuitSymbol(card.suit)}`);
    
    // Check if trick is complete
    if (game.currentTrick.length === 3) {
        setTimeout(() => {
            completeTrick();
        }, 1500);
    } else {
        // Next player's turn
        game.currentPlayer = (game.currentPlayer % 3) + 1;
        game.currentPlayerTurn = game.currentPlayer;
        showTurnScreen();
    }
    
    updateDisplay();
}

function completeTrick() {
    // Determine winner using proper suit hierarchy
    let winningPlay = game.currentTrick[0];
    let winningPower = game.getCardPower(winningPlay.card, game.trumpSuit, game.trickSuit);
    
    for (let i = 1; i < game.currentTrick.length; i++) {
        const play = game.currentTrick[i];
        const power = game.getCardPower(play.card, game.trumpSuit, game.trickSuit);
        
        if (power > winningPower) {
            winningPlay = play;
            winningPower = power;
        }
    }
    
    const winner = winningPlay.player;
    game.players[winner].tricks++;
    
    // Add card points to winner's total
    const trickPoints = game.currentTrick.reduce((sum, play) => sum + play.card.value, 0);
    game.players[winner].roundPoints += trickPoints;
    
    logMessage(`${game.players[winner].name} wins the trick (${trickPoints} points)`);
    
    // Enable declaration for the winner
    game.players[winner].canDeclare = true;
    
    // Clear trick
    game.currentTrick = [];
    game.trickSuit = null;
    game.tricksPlayed++;
    
    // Check if round is complete
    if (game.tricksPlayed === 8) {
        completeRound();
    } else {
        // Winner leads next trick
        game.currentPlayer = winner;
        game.currentPlayerTurn = winner;
        
        // Check if winner has declarations available
        const availableDeclarations = game.findKingQueenPairs(game.players[winner].hand, winner);
        if (availableDeclarations.length > 0) {
            game.gameState = 'declaration';
            showTurnScreen();
        } else {
            game.gameState = 'playing';
            showTurnScreen();
        }
    }
    
    updateDisplay();
}

function completeRound() {
    const speakingPlayer = game.players[game.speakingPlayer];
    const actualPoints = speakingPlayer.roundPoints;
    const originalBid = game.currentBid;
    const adjustedTarget = game.bidTarget;
    
    logMessage(`=== ROUND COMPLETE ===`);
    logMessage(`${game.players[game.speakingPlayer].name} scored ${actualPoints} points`);
    logMessage(`Original bid: ${originalBid}, Adjusted target: ${adjustedTarget}`);
    
    // Show all players' points and declarations for this round
    for (let i = 1; i <= 3; i++) {
        if (game.players[i].roundPoints > 0 || game.players[i].declarations.length > 0) {
            let msg = `${game.players[i].name}: ${game.players[i].roundPoints} points, ${game.players[i].tricks} tricks`;
            if (game.players[i].declarations.length > 0) {
                const declStr = game.players[i].declarations.map(d => `K-Q${getSuitSymbol(d.suit)}(${d.value})`).join(', ');
                msg += `, Declarations: ${declStr}`;
            }
            logMessage(msg);
        }
    }
    
    // Use adjusted target for scoring
    if (actualPoints >= adjustedTarget) {
        speakingPlayer.score += 1;
        logMessage(`${game.players[game.speakingPlayer].name} made their adjusted target! +1 point`);
    } else if (actualPoints < adjustedTarget / 2) {
        speakingPlayer.score -= 2;
        logMessage(`${game.players[game.speakingPlayer].name} scored less than half their target! -2 points`);
    } else {
        speakingPlayer.score -= 1;
        logMessage(`${game.players[game.speakingPlayer].name} failed their target! -1 point`);
    }
    
    // Check for game end
    const winner = Object.keys(game.players).find(id => game.players[id].score >= 10);
    if (winner) {
        logMessage(`Game Over! ${game.players[winner].name} wins with ${game.players[winner].score} points!`);
        game.gameState = 'finished';
    } else {
        game.dealer = (game.dealer % 3) + 1;
        setTimeout(() => {
            dealCardsAndStart();
        }, 5000);
    }
    
    updateDisplay();
}

function logMessage(message) {
    const gameLog = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    gameLog.appendChild(entry);
    gameLog.scrollTop = gameLog.scrollHeight;
}

// Initialize - show name entry first
document.addEventListener('DOMContentLoaded', function() {
    updateNameEntry();
});