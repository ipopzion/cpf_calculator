const submit = document.getElementById('submit');
submit.addEventListener('click', answer);

function answer(e) {
    e.preventDefault();
    let age = document.getElementById('age').value;
    let income = document.getElementById('income').value;
    const increase = document.getElementById('increase').value;
    let parameters = [age, income, increase].map(value => parseInt(value));

    let startDate = document.getElementById('startDate').value.split("-").map(value => parseInt(value));
    const endDate = document.getElementById('endDate').value.split("-").map(value => parseInt(value));
    let dates = [startDate, endDate];

    let oaBal = document.getElementById('oaBal').value;
    let saBal = document.getElementById('saBal').value;
    let maBal = document.getElementById('maBal').value;
    let balance = [oaBal, saBal, maBal].map(value => parseInt(value));

    const [finalBalance, allDates, allValues]= calculate(parameters, dates, balance);
    const [oaFinal, saFinal, maFinal] = finalBalance;
    results.innerText = `OA: ${oaFinal}\n SA: ${saFinal}\n MA: ${maFinal}`;
    generateChart(allDates, allValues)
}

function calculate(parameters, dates, balance) {
    let [startDate, endDate] = dates;
    let interest = [0, 0, 0];
    let rates;
    let allDates = [], oaSeries = [], saSeries = [], maSeries = [];

    while (!((startDate[0]==endDate[0]) && (startDate[1]==endDate[1] + 1))) {
        allDates.push(`${startDate[0]}-${startDate[1]}`);
        startDate = increaseDate(startDate);
        if (startDate[1]==1) { //check if january
            parameters = increaseParameters(parameters);
            [balance, interest] = transferInterest(balance, interest);
        }
        rates = getRates(parameters[0]);
        balance = workContribution(balance, rates, parameters[1]);
        interest = getInterest(balance, interest)
        oaSeries.push(balance[0]);
        saSeries.push(balance[1]);
        maSeries.push(balance[2]);
    }

    const allValues = [oaSeries, saSeries, maSeries]
    return [balance, allDates, allValues];
}

function getRates(age) {
    const allocationRates = [
        [35, [0.23,0.06,0.08]],
        [45, [0.21,0.07,0.09]],
        [50, [0.19,0.08,0.10]],
        [55, [0.15,0.115,0.105]],
        [60, [0.12,0.035,0.105]],
        [65, [0.035,0.025,0.105]],
        [999, [0.01,0.01,0.105]]]
    return allocationRates.reduce(function(rate, nextRate) {
        if (age >= nextRate[0]) {
            rate = nextRate;
        }
        return rate;
    })[1];
}

function increaseDate(startDate, parameters) {
    if (startDate[1] != 12) {
        startDate[1]++;
    } else {
        startDate[1] = 1;
        startDate[0]++;
    }
    return startDate;
}

function increaseParameters(parameters) {
    parameters[0]++;
    parameters[1] *= +(1+parameters[2]/100).toFixed(2)
    return parameters;
}

function workContribution(balance, rates, income) {
    for (let i=0; i<3; i++) {
        balance[i]+=income * rates[i];
    }
    balance = balance.map(bal => +bal.toFixed(2));
    return balance; 
}

function getInterest(balance, interest) {
    let [oaBal, saBal, maBal] = balance;
    let [oaInt, saInt, maInt] = interest;
    
    // OA calculation 
    if (oaBal <= 20000) {
        oaInt += oaBal * 0.035/12
    } else {
        oaInt += (20000 * 0.035/12) + ((oaBal - 20000) * 0.025/12);
    }

    // SA Calcuation 
    if ((saBal <= 40000) || (saBal + oaBal <= 60000))  {
        saInt += saBal * 0.05/12;
    } else if (oaBal >= 20000) {
        saInt += (40000 * 0.05/12) + ((saBal - 40000) * 0.04/12);
    } else {
        saInt += (60000 - oaBal) * 0.05/12 + (sa-(60000 - oaBal)) * 0.04/12;
    }

    // MA Calculation 
    if (oaBal + saBal + maBal <= 60000) {
        maInt += maBal * 0.05/12
    } else if (oaBal + saBal <= 60000){
        maInt += (60000 - oaBal - saBal) * 0.05/12 + (maBal - (60000 - oaBal - saBal)) * 0.04/12 
    } else {
        maInt += maBal * 0.04/12 
    }
    interest = [oaInt, saInt, maInt].map(interest => +interest.toFixed(2))
    return interest;
}

function transferInterest(balance, interest) {
    for (let i=0; i<3; i++) {
        balance[i]+=interest[i];
    }
    balance = balance.map(bal => +bal.toFixed(2));
    return [balance, [0, 0, 0]];
}


function generateChart(allDates, allValues) {
    var xValues = allDates;

    new Chart("balanceChart", {
    type: "line",
    data: {
        labels: xValues,
        datasets: [{
            data: allValues[0],
            borderColor: "red",
            fill: false
        },{
            data: allValues[1],
            borderColor: "green",
            fill: false
        },{
            data: allValues[2],
            borderColor: "blue",
            fill: false
        }]
    },
    options: {
        legend: {display: false}
    }
    });
}