// Vlozit do "Chrome console" a spustit (Enter). Kazdy krat sa to generuje nanovo a randomizuje, takze rovnaky vysledok nenastane len tak. Preto to pustite raz a ulozte si vysledok niekam inam

let teamsNames = ['Bombaj', 'Pune', 'Bangalúr', 'Mudaraj', 'Indore', 'Solapur', 'Ballari', 'Chennai'];
let stagesNames = ['Roverino', 'Šašo a kráľ', 'Dodgeball', 'Oddych'];
let restStageIndex = 3;
let roundTranslations = 'kolo';

// ========================================================

function getRandomNumberGenerator(seed) {
    seed = (seed || Math.floor(Math.random() * 10000000000000000)) + '';

    // https://stackoverflow.com/a/47593316/3162532 - xmur3
    let i, h;
    for (i = 0, h = 1779033703 ^ seed.length; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }

    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    seed = (h ^ h >>> 16) >>> 0;

    // https://stackoverflow.com/a/47593316/3162532 - Mulberry32
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function randomizeArray(array, randomGenerator = null) {
    return randomGenerator ? array.map(e => ({e, r: randomGenerator()})).sort((a,b) => a.r - b.r).map(e => e.e) : array;
}

// ========================================================

function robinRoundAlgorithm(teams = stagesNames.length) {
    const rounds = [];
    const middleElementIndex = Math.floor(teams/2);

    let elements = new Array(teams).fill().map((_, index) => index);

    for (let i = 0 ; i < teams - 1 ; i++) {
        const firstRow = elements.slice(0, middleElementIndex);
        const secondRow = elements.slice(middleElementIndex, teams);

        rounds.push(secondRow.map((e,i) => ([firstRow[i], e])));

        const secondRowFirstElement = elements.splice(middleElementIndex, 1)[0];
        const firstRowLastElement = elements.splice(middleElementIndex-1, 1)[0];
        elements.push(firstRowLastElement);
        elements.splice(1,0, secondRowFirstElement);
    }

    return rounds;
}

function rotateRobinRoundResults(robinRoundResults) {
    const copyOfRobinRoundResults = JSON.parse(JSON.stringify(robinRoundResults));
    const results = [];

    copyOfRobinRoundResults.forEach((round, roundIndex)=> {
        for (let i = 0 ; i < round.length ; i++) {
            results[(roundIndex*round.length) + i] = JSON.parse(JSON.stringify(round));
            round.push(round.shift());
        }
    });

    return results;
}

function optimizeRounds(rounds, roundsGroupCount, randomGenerator = null) {

    let minimalScoreRoundsGroup = null;

    // Vygenerujem si nahodne zoradenie kol a kazde nahodne zoradenie vyhodnotim
    new Array(roundsGroupCount).fill()
        .map(() => randomizeArray(rounds, randomGenerator))
        .forEach(roundsGroup => {
            const evaluation = evaluateRoundsGroup(roundsGroup);
            if (!minimalScoreRoundsGroup || evaluation.score < minimalScoreRoundsGroup.score) {
                minimalScoreRoundsGroup = evaluation;
                console.log(minimalScoreRoundsGroup.score);
            }
        });

    return minimalScoreRoundsGroup;
}

function evaluateRoundsGroup(roundsGroup, debug) {
    // Pocet poslednych zapasov, v ktorych sa hlada, ci som bojoval s rovnakym timom alebo na rovnakom turnaji
    const penalizeSameTeamIn = 4; // Rounds
    const penalizeSameTournamentIn = 3; // Rounds
    const penalisation = 2; // Tieto cisla sa nasobia indexom - teda cim vyssi index, tym menej davno som aplikoval dane pravidlo a teda vacsia prenalizacia
    const restPenalisation = 5;

    // Pocet posednych zapasov, v ktorych sa hlada, ci som bojoval s rovnakym timom alebo na rovnakom turnaji
    const noSameTeamRepetitions = 3; // Rounds
    const noSameTournamentRepetitions = 3; // Rounds
    const noSamePenalisation = 1000;

    let score = 0;

    const teamsOpponents = new Array(teamsNames.length).fill().map(() => []);
    const teamsTournaments = new Array(teamsNames.length).fill().map(() => []);

    roundsGroup.forEach(round => {
        round.forEach((match, tournament) => {
            const team1 = match[0];
            const team2 = match[1];

            teamsOpponents[team1].push(team2);
            teamsOpponents[team2].push(team1);

            teamsTournaments[team1].push(tournament);
            teamsTournaments[team2].push(tournament);
        });
    });

    for (let team = 0 ; team < teamsOpponents.length ; team++) {
        const lastOpponents = [];

        for (let opponentIndex = 0 ; opponentIndex < teamsOpponents[team].length ; opponentIndex++) {
            let opponent = teamsOpponents[team][opponentIndex];

            if (lastOpponents.includes(opponent)) {
                score += lastOpponents.indexOf(opponent) * penalisation;
            }

            lastOpponents.push(opponent);
            if (lastOpponents.length > penalizeSameTeamIn) {
                lastOpponents.shift();
            }

            if (lastOpponents.length === penalizeSameTeamIn) {
                if (new Set(lastOpponents.slice(-noSameTeamRepetitions)).size === 1) {
                    score += noSamePenalisation;
                }
            }
        }
    }

    for (let team = 0 ; team < teamsTournaments.length ; team++) {
        const lastTournaments = [];

        for (let tournamentIndex = 0 ; tournamentIndex < teamsTournaments[team].length ; tournamentIndex++) {
            let tournament = teamsTournaments[team][tournamentIndex];

            if (lastTournaments.includes(tournament)) {
                score += lastTournaments.indexOf(tournament) * (tournament === restStageIndex ? penalisation : restPenalisation);
            }

            lastTournaments.push(tournament);
            if (lastTournaments.length > penalizeSameTournamentIn) {
                lastTournaments.shift();
            }

            if (lastTournaments.length === penalizeSameTournamentIn) {
                if (debug && team === 5) {
                    console.log(lastTournaments.slice(-noSameTournamentRepetitions));
                }

                if (new Set(lastTournaments.slice(-noSameTournamentRepetitions)).size === 1) {
                    score += noSamePenalisation;
                }
            }
        }
    }

    return {
        score,
        roundsGroup,
        teamsOpponents,
        teamsTournaments,
    };
}

function printRounds(minimalScoreRoundsGroup, printRounds = true, printStatistics = true,) {
    const longestStageName = stagesNames.reduce( (res, cur) => cur.length > res.length ? cur : res, '');
    const longestTeamName = teamsNames.reduce( (res, cur) => cur.length > res.length ? cur : res, '');
    const spacesAfterStageName = 10;
    const spacesAfterTeamName = 5;

    let result  = ``;

    if (printRounds) {
        minimalScoreRoundsGroup.roundsGroup.forEach((round, roundIndex) => {
            result = result + `${(roundIndex + 1)}. ${roundTranslations}\n`;

            round.forEach((stage, stageIndex) => {
                const stageNameSpaces = longestStageName.length - stagesNames[stageIndex].length + spacesAfterStageName;
                const teamNameSpaces = longestTeamName.length - teamsNames[stage[0]].length + spacesAfterTeamName;

                result = result + `${stagesNames[stageIndex]} ${(new Array(stageNameSpaces)).fill(' ').join('')} ${teamsNames[stage[0]]} ${(new Array(teamNameSpaces)).fill(' ').join('')} - ${(new Array(spacesAfterTeamName)).fill(' ').join('')} ${teamsNames[stage[1]]}\n`;
            });

            result = result + `\n`;
        });
    }

    if (printStatistics) {
        result += `Oponenti:\n`;
        minimalScoreRoundsGroup.teamsOpponents.forEach((opponents, teamIndex) => {
            const teamNameSpaces = longestTeamName.length - teamsNames[teamIndex].length;
            result = result + `${teamIndex} ${teamsNames[teamIndex]}${(new Array(teamNameSpaces)).fill(' ').join('')}\t | ${opponents.join('  ')}\n`;
        });

        result += `\nTurnaje:\t | `;
        stagesNames.forEach((tournament, tournamentIndex) => {
            result += `${tournamentIndex} ${tournament}\t\t`;
        });
        result += `\n`;
        minimalScoreRoundsGroup.teamsTournaments.forEach((tournaments, teamIndex) => {
            const teamNameSpaces = longestTeamName.length - teamsNames[teamIndex].length;
            result = result + `${teamsNames[teamIndex]}${(new Array(teamNameSpaces)).fill(' ').join('')}\t | ${tournaments.join('  ')}\n`;
        });
    }

    if (result) {
        console.log(result);
    }
}

// ========================================================

// Dost dobry seed je
//      25000, Turnaje
//      10000, asd
//      10000, ghj
//      25000, 126as6d5f - 450
printRounds(
    optimizeRounds(
        rotateRobinRoundResults(
            robinRoundAlgorithm(teamsNames.length)
        ),
        25000,
        getRandomNumberGenerator('126as6d5f')
    ),
    true,
    true
);
