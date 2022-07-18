// Vlozit do "Chrome console" a spustit (Enter). Kazdy krat sa to generuje nanovo a randomizuje, takze rovnaky vysledok nenastane len tak. Preto to pustite raz a ulozte si vysledok niekam inam

// Konfiguracia
var teamsNames = ['Bangalúr', 'Mudaraj', 'Indore', 'Bombaj', 'Ballari', 'Chennaj', 'Solapur', 'Pune'];
var stagesNames = ['Roverino', 'Šašo a kráľ', 'Dodgeball', 'Oddych'];
var roundTranslations = 'kolo';
var randomizeTeams = false;
var randomizeRounds = true;
var applyShuffle = !randomizeRounds;   // Toto pouzivat ked mam randomizeRounds = false
var spacesAfterStageName = 10;
var spacesAfterTeamName = 5;
var debug = false;

// ====================================================================================================================

// Robin round algoritmus - vytvori vsetky kombinacie timov pre jeden turnaj tak, aby hral kazdy s kazdym a nikto nesedel
// Pouzite cisla su nahodne zamiesane, aby som dostaval stale ine vysledky
//
//  1 2 3 4
//  | | | |  =>  1-8, 2-7, 3-6, 4-5
//  8 7 6 5
//
//  >->->->
// |1|8 2 3      // 1 stale ostava na svojom mieste
//  | | | |  =>  1-7, 8-6, 2-5, 3-4
//  7 6 5 4
//  <-<-<-<
//
// Takto sa to rotuje az kym sa nedostanem do povodneho stavu
// Pre 8 timov to znamena 7 rotacii (kol) a kazde kolo ma 4 sucasne prebiehajuce hry
function robinRound(teams = teamsNames.length, randomize = true) {
    const rounds = [];
    const middleElementIndex = Math.floor(teams/2);
    const elements = randomizeArray(new Array(teams).fill().map((_, index) => index), randomize);

    for (let i = 0 ; i < teams - 1 ; i++) {
        const firstRow = elements.slice(0, middleElementIndex);
        const secondRow = elements.slice(middleElementIndex, teams);

        rounds.push(secondRow.map((e,i) => ([firstRow[i], e])));

        const secondRowFirstElement = elements.splice(middleElementIndex, 1)[0];
        const firstRowLastElement = elements.splice(middleElementIndex-1, 1)[0];
        elements.push(firstRowLastElement);
        elements.splice(1,0,secondRowFirstElement);
    }

    debugMessage("Robin  Round:");
    debugMessage(rounds);
    debugMessage("");

    return rounds;
}

// Vysledky z robinRound (dvojice) zrotujem poctom dvojic (pre 8 timov to su 4 dvojice. Malo by to ale realne byt poctom turnajov, ktory by sa mal rovnat poctu dvojic timov)
//
// 1-8, 2-7, 3-6, 4-5   =>  1-8, 2-7, 3-6, 4-5
//                          2-7, 3-6, 4-5, 1-8
//                          3-6, 4-5, 1-8, 2-7
//                          4-5, 1-8, 2-7, 3-6
//
// Taketo zrotovane dvojice sa stretnu kazdy s kazdym na 4 turnajoch a vzdy bude mat kto s kym hrat
function rotateRobinRoundResults(robinRoundResults) {
    const copyOfRobinRoundResults = JSON.parse(JSON.stringify(robinRoundResults));
    const results = [];

    copyOfRobinRoundResults.forEach((round, roundIndex)=> {
        for (let i = 0 ; i < round.length ; i++) {
            results[(roundIndex*round.length) + i] = JSON.parse(JSON.stringify(round));
            round.push(round.shift());
        }
    });

    debugMessage("Rotated Robin Round Results:");
    debugMessage(results);
    debugMessage("");

    return results;
}

// Nahodne zamiesa prvky pola
function randomizeArray(array, randomize = true) {
    const randomizedArray = randomize ? array.map(e => ({e, r: Math.random()})).sort((a,b) => a.r - b.r).map(e => e.e) : array;

    debugMessage("Randomized array:");
    debugMessage(randomizedArray);
    debugMessage("");

    return randomizedArray;
}

// TODO - toto zatial vobec nefunguje
// // Pomocou heuristik sa snazi usporiadat jednotlive kola tak, aby:
// //      timy neboli dlho na jednom turnaji
// //      timy nesuperili opakovane s rovnakym timom
// function optimizeRotatedRobinRoundResults(rotatedRobinRoundResults) {
//     const availableRounds = JSON.parse(JSON.stringify(rotatedRobinRoundResults));
//     const optimizedRoundsOrder = [];
//
//     while (availableRounds.length > 0) {
//         const availableRoundsHeuristicEvaluation = availableRounds.map(round => {
//             let roundHeuristicEvaluation = 0;
//
//             round.forEach((teamsPair, tournamentIndex) => {
//                 // Pravidla evaluacie:
//                 //  Pravidla pre vzajomne strety timov
//                 //      kolko kol dozadu hrali s timy proti sebe (cim viac, tym vacsi pravdepodobnost, ze ich dam znova proti sebe)
//                 //      kolko krat hrali s timy proti sebe (cim viac, tym mensia pravdepodobnost, ze si znova zahraju proti sebe)
//                 //  Pravidla pre ucast na turnaji
//                 //      kedy naposledy hrali dany turnaj (cim neskor, tym vacsia pravdepodobnost, ze sa dostanu na turnaj)
//                 //      kolko krat hral tim dany turnaj (cim viac, tym mensia pravdepodobnost ze na turnaj pojdu)
//
//                 let lastMatch = 0;
//                 let matches = 0;
//                 let lastTournament = 0;
//                 let tournaments = 0;
//
//                 optimizedRoundsOrder.forEach((optimizedRound, optimizedRoundIndex) => {
//                     if (optimizedRound.filter((orTeamsPair) => orTeamsPair.includes(teamsPair[0]) && orTeamsPair.includes(teamsPair[1]))) {
//                         lastMatch = optimizedRoundsOrder.length - optimizedRoundIndex;
//                         matches++;
//                     }
//
//                     if (optimizedRound.filter((_, orTournamentIndex) => orTournamentIndex === tournamentIndex)) {
//                         lastTournament = optimizedRoundsOrder.length - tournamentIndex;
//                         tournaments++;
//                     }
//                 });
//
//                 if (matches === 0) {
//                     matches = 10;
//                 }
//
//                 if (tournaments === 0) {
//                     tournaments = 10;
//                 }
//
//                 console.log(lastMatch, matches, lastTournament, tournaments);
//
//                 roundHeuristicEvaluation += lastMatch/matches + lastTournament/tournaments;
//             });
//
//             return roundHeuristicEvaluation;
//         });
//
//         debugMessage("Heuristic evaluation of available rounds:");
//         debugMessage(availableRoundsHeuristicEvaluation);
//         debugMessage("");
//
//         const roundIndexWithMaxHeuristicValue = availableRoundsHeuristicEvaluation.reduce((res, cur, index, arr) => cur > arr[res] ? index : res, 0);
//         optimizedRoundsOrder.push(availableRounds[roundIndexWithMaxHeuristicValue]);
//         availableRounds.splice(roundIndexWithMaxHeuristicValue, 1);
//     }
//
//     return optimizedRoundsOrder;
// }

// Toto je malo ucinne - len to rovnomerne rozdeli vysledok z rotateRobinRoundResults tak, aby dva timy hrali proti sebe vzdy po rovnakom case
// Sposobi to ale to, ze jeden tim uviazne na jednom turnaji na velmi dlho
function simpleShuffle(robinRoundResults) {
    let results = [];

    if (applyShuffle) {
        const rounds = robinRoundResults.length;
        const couples = Math.floor(teamsNames.length/2);
        const blockSize = Math.floor(rounds/couples);

        robinRoundResults.forEach((round, roundIndex) => {
            const block = (roundIndex % couples);
            const blockOrder = Math.floor(roundIndex / couples);
            results[block*blockSize + blockOrder] = round;
        });
    } else {
        results = robinRoundResults
    }

    return results;
}

// Snazim sa vyhnut stavom, ze idem treti krat po sebe hrat rovnaky turnaj alebo ze idem treti krat po sebe hrat s proti rovnakemu timu
function simpleOptimization(robinRoundResults) {

    // Pre istotu to zopakujem 3 krat
    for (let r = 0 ; r < 3 ; r++) {
        for (let i = 2 ; i < robinRoundResults.length ; i++) {
            let moveToEnd = false;

            // for (let j = ) {
            //
            // }
            robinRoundResults[i].forEach((teamsPair, tournamentIndex) => {
                if (robinRoundResults[i-1][]) {

                }
            });
        }
    }

    const index = 1;
    const restStageIndex = stagesNames.length-1;    // Oddych je stale posledny turnaj

    while (index < robinRoundResults.length) {
        if (robinRoundResults[index-1][restStageIndex].includes(robinRoundResults[index][restStageIndex][0] || )) {

        }
    }

    return robinRoundResults;
}

function printRounds(rotatedRobinRoundResults) {
    const longestStageName = stagesNames.reduce( (res, cur) => cur.length > res.length ? cur : res, '');
    const longestTeamName = teamsNames.reduce( (res, cur) => cur.length > res.length ? cur : res, '');

    let result  = '';

    rotatedRobinRoundResults.forEach((round, roundIndex) => {
        result = result + `${(roundIndex + 1)}. ${roundTranslations}\n`;

        round.forEach((stage, stageIndex) => {
            const stageNameSpaces = longestStageName.length - stagesNames[stageIndex].length + spacesAfterStageName;
            const teamNameSpaces = longestTeamName.length - teamsNames[stage[0]].length + spacesAfterTeamName;

            result = result + `${stagesNames[stageIndex]} ${(new Array(stageNameSpaces)).fill(' ').join('')} ${teamsNames[stage[0]]} ${(new Array(teamNameSpaces)).fill(' ').join('')} - ${(new Array(spacesAfterTeamName)).fill(' ').join('')} ${teamsNames[stage[1]]}\n`;
        });

        result = result + `\n`
    });

    console.log(result);
}

function debugMessage(message) {
    if (debug) console.log(message);
}

printRounds(
    // simpleShuffle(
        // optimizeRotatedRobinRoundResults(
            simpleOptimization(
                randomizeArray(
                    rotateRobinRoundResults(
                        robinRound(teamsNames.length, randomizeTeams)
                    ), randomizeRounds
                )
            )
        // )
    // )
);
