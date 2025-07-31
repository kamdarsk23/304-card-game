class Game304 {
    constructor() {
        this.currentPlayer = null;
        this.gameState = 'login'; // login, dealing, bidding, trump, playing, finished
        this.players = {
            1: { hand: [], score: 0, bid: null, tricks: 0 },
            2: { hand: [], score: 0, bid: null, tricks: 0 },
            3: { hand: [], score: 0, bid: null, tricks: 0 }
        };
        this.deck = [];
        this.currentBid = 0;
        this.currentBidder = null;
        this.biddingOrder = [];
        this.currentBiddingIndex = 0;
        this.trumpSuit = null;
        this.speakingPlayer = null;
        this.dealer = 1;
        this.currentTrick = [];
        this.trickSuit = null;
        this.currentPlayerTurn = null;
        this.tricksPlayed = 0;
        
        this.cardValues = {
            '9': 20, '10': 10, 'J': 30, 'Q': 2, 'K': 3, 'A': 11
        };
        
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.ranks = ['9', '10', 'J', 'Q', 'K', 'A'];
        
        this.initializeDeck();
        this.loadGameState();
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

    saveGameState() {
        const state = {
            players: this.players,
            gameState: this.gameState,
            currentBid: this.currentBid,
            currentBidder: this.currentBidder,
            biddingOrder: this.biddingOrder,
            currentBiddingIndex: this.currentBiddingIndex,
            trumpSuit: this.trumpSuit,
            speakingPlayer: this.speakingPlayer,
            dealer: this.dealer,
            currentTrick: this.currentTrick,
            trickSuit: this.trickSuit,
            currentPlayerTurn: this.currentPlayerTurn,
            tricksPlayed: this.tricksPlayed
        };
        localStorage.setItem('game304State', JSON.stringify(state));
    }

    loadGameState() {
        const saved = localStorage.getItem('game304State');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.players = state.players || this.players;
                this.gameState = state.gameState || 'login';
                this.currentBid = state.currentBid || 0;
                this.currentBidder = state.currentBidder || null;
                this.biddingOrder = state.biddingOrder || [];
                this.currentBiddingIndex = state.currentBiddingIndex || 0;
                this.trumpSuit = state.trumpSuit || null;
                this.speakingPlayer = state.speakingPlayer || null;
                this.dealer = state.dealer || 1;
                this.currentTrick = state.currentTrick || [];
                this.trickSuit = state.trickSuit || null;
                this.currentPlayerTurn = state.currentPlayerTurn || null;
                this.tricksPlayed = state.tricksPlayed || 0;
                console.log('Loaded saved game state');
            } catch (e) {
                console.log('Error loading saved state, starting fresh');
                localStorage.removeItem('game304State');
            }
        } else {
            console.log('No saved state found, starting fresh');
        }
    }

    dealInitialCards() {
        this.shuffleDeck();
        let deckIndex = 0;
        
        // Deal 4 cards to each player starting from dealer's left
        for (let round = 0; round < 4; round++) {
            for (let playerOffset = 1; playerOffset <= 3; playerOffset++) {
                const playerId = ((this.dealer + playerOffset - 1) % 3) + 1;
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
            for (let playerOffset = 1; playerOffset <= 3; playerOffset++) {
                const playerId = ((this.dealer + playerOffset - 1) % 3) + 1;
                this.players[playerId].hand.push(this.remainingDeck[deckIndex++]);
            }
        }
    }

    startBidding() {
        // Find player with lowest score to be the dealer
        let lowestScore = Math.min(...Object.values(this.players).map(p => p.score));
        let dealerPlayer = Object.keys(this.players).find(id => 
            this.players[id].score === lowestScore
        );
        
        this.dealer = parseInt(dealerPlayer);
        this.biddingOrder = [];
        
        // Set bidding order starting from dealer's left (dealer goes last)
        for (let i = 1; i <= 3; i++) {
            this.biddingOrder.push(((this.dealer + i - 1) % 3) + 1);
        }
        
        this.currentBiddingIndex = 0;
        this.currentBid = 0;
        this.currentBidder = null;
        this.gameState = 'bidding';
        
        console.log(`Dealer: Player ${this.dealer}`);
        console.log(`Bidding order: ${this.biddingOrder.join(', ')}`);
    }

    getCardPower(card, trumpSuit, trickSuit) {
        if (card.suit === trumpSuit) return 1000 + this.cardValues[card.rank];
        if (card.suit === trickSuit) return 100 + this.cardValues[card.rank];
        return this.cardValues[card.rank];
    }

    isValidPlay(card, playerHand, trickSuit, trumpSuit) {
        if (!trickSuit) return true; // First card of trick
        
        // Must follow suit if possible
        const hasTrickSuit = playerHand.some(c => c.suit === trickSuit);
        if (hasTrickSuit && card.suit !== trickSuit) {
            // Can only play trump if no trick suit
            return card.suit === trumpSuit;
        }
        
        return true;
    }
}

let game = new Game304();

function selectPlayer(playerId) {
    game.currentPlayer = playerId;
    document.getElementById('currentPlayer').textContent = `Player ${playerId}`;
    
    if (game.gameState === 'login') {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        
        // Check if we should start a new game or continue
        if (Object.values(game.players).every(p => p.hand.length === 0)) {
            startNewRound();
        } else {
            updateGameDisplay();
        }
    } else {
        updateGameDisplay();
    }
}

function startNewRound() {
    // Reset for new round
    Object.values(game.players).forEach(p => {
        p.hand = [];
        p.bid = null;
        p.tricks = 0;
    });
    
    game.currentTrick = [];
    game.trickSuit = null;
    game.trumpSuit = null;
    game.tricksPlayed = 0;
    game.currentBid = 0;
    game.currentBidder = null;
    game.currentBiddingIndex = 0;
    game.biddingOrder = [];
    game.speakingPlayer = null;
    game.currentPlayerTurn = null;
    
    game.dealInitialCards();
    game.startBidding();
    updateGameDisplay();
    logMessage("New round started! Initial cards dealt.");
    logMessage(`Dealer is Player ${game.dealer}. Bidding starts with Player ${game.biddingOrder[0]}.`);
}

function resetGame() {
    localStorage.removeItem('game304State');
    Object.values(game.players).forEach(p => {
        p.hand = [];
        p.score = 0;
        p.bid = null;
        p.tricks = 0;
    });
    game.dealer = 1;
    startNewRound();
}

function updateGameDisplay() {
    // Update scores
    document.getElementById('score1').textContent = game.players[1].score;
    document.getElementById('score2').textContent = game.players[2].score;
    document.getElementById('score3').textContent = game.players[3].score;
    
    // Update game phase
    let phaseText = '';
    switch(game.gameState) {
        case 'bidding':
            phaseText = `Bidding - Player ${game.biddingOrder[game.currentBiddingIndex]}'s turn`;
            break;
        case 'trump':
            phaseText = `Select Trump Suit - Player ${game.speakingPlayer}`;
            break;
        case 'playing':
            phaseText = `Playing - Player ${game.currentPlayerTurn}'s turn`;
            break;
        default:
            phaseText = game.gameState;
    }
    document.getElementById('gamePhase').textContent = phaseText;
    
    // Show/hide UI elements based on game state
    const biddingArea = document.getElementById('biddingArea');
    const trumpSelection = document.getElementById('trumpSelection');
    
    biddingArea.classList.toggle('hidden', game.gameState !== 'bidding');
    trumpSelection.classList.toggle('hidden', game.gameState !== 'trump');
    
    // Update bidding display
    if (game.gameState === 'bidding') {
        document.getElementById('currentBid').textContent = game.currentBid;
        document.getElementById('currentBidder').textContent = game.currentBidder || 'None';
        
        const currentBiddingPlayer = game.biddingOrder[game.currentBiddingIndex];
        const isPlayerTurn = currentBiddingPlayer === game.currentPlayer;
        
        document.getElementById('bidBtn').disabled = !isPlayerTurn;
        document.getElementById('passBtn').disabled = !isPlayerTurn;
        document.getElementById('bidInput').disabled = !isPlayerTurn;
        
        // Update turn indicator
        const turnIndicator = document.getElementById('turnIndicator');
        if (isPlayerTurn) {
            turnIndicator.textContent = "YOUR TURN TO BID";
            turnIndicator.style.color = "#ffd700";
            turnIndicator.style.fontWeight = "bold";
        } else {
            turnIndicator.textContent = `Waiting for Player ${currentBiddingPlayer} to bid`;
            turnIndicator.style.color = "white";
            turnIndicator.style.fontWeight = "normal";
        }
    }
    
    // Update trump display
    document.getElementById('trumpSuit').textContent = game.trumpSuit ? getSuitSymbol(game.trumpSuit) : 'None';
    
    // Update trump selection visibility
    if (game.gameState === 'trump') {
        const canSelectTrump = game.speakingPlayer === game.currentPlayer;
        document.querySelectorAll('.suit-btn').forEach(btn => {
            btn.disabled = !canSelectTrump;
        });
    }
    
    // Display player's hand
    displayHand();
    displayPlayedCards();
    
    game.saveGameState();
}

function displayHand() {
    const handContainer = document.getElementById('hand');
    handContainer.innerHTML = '';
    
    const playerHand = game.players[game.currentPlayer].hand;
    
    playerHand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.suit}`;
        cardElement.innerHTML = `
            <div class="value">${card.rank}</div>
            <div class="suit">${getSuitSymbol(card.suit)}</div>
        `;
        
        // Make card playable if it's player's turn and valid
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
    
    // Clear all slots
    slots.forEach(slotId => {
        document.getElementById(slotId).innerHTML = '';
    });
    
    // Display played cards
    game.currentTrick.forEach((play, index) => {
        const slot = document.getElementById(slots[index]);
        slot.innerHTML = `
            <div class="card ${play.card.suit}">
                <div class="value">${play.card.rank}</div>
                <div class="suit">${getSuitSymbol(play.card.suit)}</div>
            </div>
            <div style="font-size: 0.8rem; margin-top: 5px;">P${play.player}</div>
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

function placeBid() {
    const bidInput = document.getElementById('bidInput');
    const bidAmount = parseInt(bidInput.value);
    
    if (bidAmount <= game.currentBid) {
        alert('Bid must be higher than current bid');
        return;
    }
    
    if (bidAmount > 304) {
        alert('Bid cannot exceed 304');
        return;
    }
    
    const currentPlayer = game.biddingOrder[game.currentBiddingIndex];
    game.currentBid = bidAmount;
    game.currentBidder = currentPlayer;
    game.players[currentPlayer].bid = bidAmount;
    
    logMessage(`Player ${currentPlayer} bids ${bidAmount}`);
    
    nextBiddingTurn();
    bidInput.value = '';
    updateGameDisplay();
}

function pass() {
    const currentPlayer = game.biddingOrder[game.currentBiddingIndex];
    logMessage(`Player ${currentPlayer} passes`);
    
    nextBiddingTurn();
    updateGameDisplay();
}

function nextBiddingTurn() {
    game.currentBiddingIndex++;
    
    // Check if bidding is complete (everyone has had a chance after last bid)
    if (game.currentBiddingIndex >= game.biddingOrder.length) {
        if (game.currentBidder) {
            // Bidding complete, speaking player selects trump
            game.speakingPlayer = game.currentBidder;
            game.gameState = 'trump';
            logMessage(`Player ${game.speakingPlayer} won the bidding with ${game.currentBid}`);
        } else {
            // No one bid, dealer speaks
            game.speakingPlayer = game.dealer;
            game.currentBid = 1; // Minimum bid
            game.gameState = 'trump';
            logMessage(`No bids placed. Player ${game.speakingPlayer} (dealer) must speak with minimum bid.`);
        }
    }
}

function selectTrump(suit) {
    if (game.speakingPlayer === game.currentPlayer) {
        game.trumpSuit = suit;
        game.dealRemainingCards();
        game.gameState = 'playing';
        game.currentPlayerTurn = game.speakingPlayer;
        
        logMessage(`Player ${game.speakingPlayer} selected ${getSuitSymbol(suit)} as trump suit`);
        logMessage("Remaining cards dealt. Game begins!");
        
        updateGameDisplay();
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
    
    logMessage(`Player ${game.currentPlayer} plays ${card.rank}${getSuitSymbol(card.suit)}`);
    
    // Check if trick is complete
    if (game.currentTrick.length === 3) {
        completeTrick();
    } else {
        // Next player's turn
        game.currentPlayerTurn = (game.currentPlayerTurn % 3) + 1;
    }
    
    updateGameDisplay();
}

function completeTrick() {
    // Determine winner
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
    
    logMessage(`Player ${winner} wins the trick`);
    
    // Calculate points for this trick
    const trickPoints = game.currentTrick.reduce((sum, play) => sum + play.card.value, 0);
    
    // Clear trick
    game.currentTrick = [];
    game.trickSuit = null;
    game.tricksPlayed++;
    
    // Check if round is complete
    if (game.tricksPlayed === 8) {
        completeRound();
    } else {
        // Winner leads next trick
        game.currentPlayerTurn = winner;
    }
}

function completeRound() {
    // Calculate total points for speaking player
    let speakingPlayerPoints = 0;
    
    // Count all card values in tricks won by speaking player
    Object.values(game.players).forEach(player => {
        if (player.tricks > 0) {
            // This is simplified - in a real game you'd need to track which cards were in which tricks
            // For now, we'll estimate based on average card value and tricks won
            const avgCardValue = Object.values(game.cardValues).reduce((a,b) => a+b) / Object.values(game.cardValues).length;
            speakingPlayerPoints += player.tricks * avgCardValue * (player === game.players[game.speakingPlayer] ? 1 : 0);
        }
    });
    
    // Simplified scoring - count total card values won by speaking player
    // In a full implementation, you'd track exactly which cards were won
    const speakingPlayer = game.players[game.speakingPlayer];
    const tricksWon = speakingPlayer.tricks;
    const estimatedPoints = tricksWon * 38; // Average points per trick
    
    const bid = game.currentBid;
    
    if (estimatedPoints >= bid) {
        speakingPlayer.score += 1;
        logMessage(`Player ${game.speakingPlayer} made their bid! +1 point`);
    } else if (estimatedPoints < bid / 2) {
        speakingPlayer.score -= 2;
        logMessage(`Player ${game.speakingPlayer} scored less than half their bid! -2 points`);
    } else {
        speakingPlayer.score -= 1;
        logMessage(`Player ${game.speakingPlayer} failed their bid! -1 point`);
    }
    
    // Check for game end (first to reach target score)
    const winner = Object.keys(game.players).find(id => game.players[id].score >= 10);
    if (winner) {
        logMessage(`Game Over! Player ${winner} wins with ${game.players[winner].score} points!`);
        game.gameState = 'finished';
    } else {
        // Start new round
        game.dealer = (game.dealer % 3) + 1;
        setTimeout(() => {
            startNewRound();
        }, 3000);
    }
    
    updateGameDisplay();
}

function logMessage(message) {
    const gameLog = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    gameLog.appendChild(entry);
    gameLog.scrollTop = gameLog.scrollHeight;
}

// Initialize game display
if (game.gameState !== 'login') {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    updateGameDisplay();
}

// Add debugging for initial load
console.log('Game initialized with state:', game.gameState);
console.log('Current dealer:', game.dealer);
console.log('Players hands:', Object.entries(game.players).map(([id, p]) => `P${id}: ${p.hand.length} cards`));

// Auto-refresh game state every 2 seconds to sync between players
setInterval(() => {
    if (game.currentPlayer) {
        const currentState = JSON.stringify(game.players) + game.gameState + game.currentBid + game.trumpSuit;
        game.loadGameState();
        const newState = JSON.stringify(game.players) + game.gameState + game.currentBid + game.trumpSuit;
        
        if (currentState !== newState) {
            console.log('Game state updated, refreshing display');
            updateGameDisplay();
        }
    }
}, 2000);