

function gaussianRandom(mean=0, stdev=1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

export async function calculateDiffs(data: any[]): Promise<number[]> {
    return data.map(item => (
        item.close / item.open
    )) as number[];
}

export async function calculateMacd(data: any[]): Promise<Map<number, number[]>> {
    console.log('simData', data)
    const sims = data.map(d => d.macd)
    let returnSims = new Map<number, number[]>()
    returnSims.set(50, sims)

    // for (let i = 0; i < 100; i++) {
    //     returnSims.set(i, data[i].close)
    // }
    return returnSims;
    // return data.map(item => {
    //     return item.close
    // }) as number[];
}

export async function runSimulation(avg: number, std: number, simLength: number): Promise<number[]> {
    let prices = []

    let drift = avg - ((std^2)/2)

    for (let i = 0; i < simLength; i++) {
        let lastPrice: number = prices[prices.length - 1] || 1;
        let volatilty: number = std * gaussianRandom();
        let price: number = lastPrice * Math.pow(Math.E, drift + volatilty);
        prices.push(price);
    }

    return prices;
}

export async function predictPrices(diffs: number[], numSims: number = 1000, simLength: number = 100, percentiles: number[] = [40, 50, 60]): Promise<Map<number, number[]>> {
    let avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    let std = Math.sqrt(diffs.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / diffs.length);
    // console.log(avg, std)

    let sims: Promise<number[]>[] = []
    for (let i = 0; i < numSims; i++) {
        sims[i] = runSimulation(avg, std, simLength)
    }

    return await Promise.all(sims)
        .then(sims => {
            sims.sort((a, b) => a.at(-1)! - b.at(-1)!)

            let returnSims = new Map<number, number[]>()

            for (let p of percentiles) {
                returnSims.set(p, sims[Math.floor(numSims * (p / 100))])
            }
            console.log('returnSims', returnSims)
            return returnSims;
        })
}
