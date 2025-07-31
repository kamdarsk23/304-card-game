# 304 Card Game

A web-based implementation of the 304 card game for 3 players.

## Game Rules

304 is a trick-taking card game played with 3 players using cards from 9 to Ace.

### Card Values
- 9: 20 points
- 10: 10 points  
- J: 30 points
- Q: 2 points
- K: 3 points
- A: 11 points

### How to Play

1. **Setup**: The player with the lowest score deals 4 cards to each player (starting from their left)

2. **Bidding**: Players bid on who gets to "speak" (declare trump). The speaking player must score at least their bid amount to gain points.

3. **Trump Declaration**: The winning bidder declares a trump suit

4. **Second Deal**: 4 more cards are dealt to each player

5. **Trick Play**: 
   - Speaking player leads first trick
   - Players must follow suit if possible
   - Can play trump if no suit cards available
   - Highest card wins trick (trump > trick suit > other suits)

6. **Scoring**:
   - Made bid: +1 point
   - Failed bid: -1 point  
   - Scored less than half bid: -2 points

## How to Use

1. Open the game in your browser
2. Each player selects their player number (1, 2, or 3)
3. Only the current player can see their hand and make moves
4. Game state is saved locally so players can refresh and continue

## Deployment

This game is designed to be hosted on GitHub Pages. Simply push to a GitHub repository and enable Pages in the repository settings.

## Local Development

Open `index.html` in any modern web browser to test locally.