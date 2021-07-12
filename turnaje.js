let teamsNames = ['Chobotnice', 'Tigre', 'Krokodíly', 'Levy', 'Nosorožce', 'Hady', 'Pirane', 'Žraloky'];
let stagesNames = ['Hory a údolia', 'Balónový basketbal', 'Futbalo-hádzaná', 'Oddych'];

function robinRoundAlgorithm(teams = 8, randomize = true) {
    const rounds = [];
    const middleElementIndex = Math.floor(teams/2);

    let elements = new Array(teams).fill().map((_, index) => index);
    if (randomize) {
        elements = randomizeArray(elements);
    }

    for (let i = 0 ; i < teams - 1 ; i++) {
        const firstRow = elements.slice(0, middleElementIndex);
        const secondRow = elements.slice(middleElementIndex, teams);

        rounds.push(secondRow.map((e,i) => ([firstRow[i], e])));

        const secondRowFirstElement = elements.splice(middleElementIndex, 1)[0];
        const firstRowLastElement = elements.splice(middleElementIndex-1, 1)[0];
        elements.push(firstRowLastElement);
        elements.splice(1,0,secondRowFirstElement);
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

function randomizeArray(array, randomize = true) {
    return randomize ? array.map(e => ({e, r: Math.random()})).sort((a,b) => a.r - b.r).map(e => e.e) : array;
}

function printRounds(rotatedRobinRoundResults) {
    const longestStageName = stagesNames.reduce( (res, cur) => cur.length > res.length ? cur : res, '');
    const longestTeamName = teamsNames.reduce( (res, cur) => cur.length > res.length ? cur : res, '');
    const spacesAfterStageName = 10;
    const spacesAfterTeamName = 5;

    let result  = '';

    rotatedRobinRoundResults.forEach((round, roundIndex) => {
        result = result + `${(roundIndex + 1)}. kolo\n`;

        round.forEach((stage, stageIndex) => {
            const stageNameSpaces = longestStageName.length - stagesNames[stageIndex].length + spacesAfterStageName;
            const teamNameSpaces = longestTeamName.length - teamsNames[stage[0]].length + spacesAfterTeamName;

            result = result + `${stagesNames[stageIndex]} ${(new Array(stageNameSpaces)).fill(' ').join('')} ${teamsNames[stage[0]]} ${(new Array(teamNameSpaces)).fill(' ').join('')} - ${(new Array(spacesAfterTeamName)).fill(' ').join('')} ${teamsNames[stage[1]]}\n`;
        });

        result = result + `\n`
    });

    console.log(result);
}

printRounds(randomizeArray(rotateRobinRoundResults(robinRoundAlgorithm(teamsNames.length, true)), true));
