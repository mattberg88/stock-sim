import { NextResponse } from "next/server";
import twelvedata from "twelvedata";
import { kv } from "@vercel/kv";
import {buildCnn, cnn} from "../../../2b_cnn"

type CacheItem = {
    data: string
    // data2: string
    cachedAt: Date
}

export async function GET(req: Request, { params }: { params: { ticker: string } }) {

    // Logic for this endpoint:
    // 1. Check cache for data
    // 2. If cache empty or invalid, refetch data
    // 3. Store new data in cache
    // 4. Return data to user

    const cached = await kv.get<CacheItem>(params.ticker);

    let data;
    let data2;

    // if (cached !== null) {
    //     console.log("Cache HIT")
    //     data = JSON.parse(cached.data)
    //     // data2= JSON.parse(cached.data2)
    //     console.log('data', data)
    // }
    // else {
        console.log("Cache MISS")

        const client = twelvedata({
            key: process.env.TWELVEDATA_API_KEY,
        });

        // Get from API
        data = await client.timeSeries({
                symbol: params.ticker,
                interval: "1day",
                outputsize: 100,
            }).then((res) => {
                return {
                    dates: res.values.map((r: any) => r.datetime),
                    highs: res.values.map((r: any) => r.high)
                }
            })

        console.log('Beginning AAPL CNN tests at ' + new Date() + '... this may take a while!')
        buildCnn(data).then(function (built: any) {
            cnn(built.model, built.data, 100).then(function (e) {
            console.log('Completed tests at ' + new Date() + '... thanks for waiting!')
            })
        })

        // Store in cache
        kv.set(params.ticker, {
            data: JSON.stringify(data),
            cachedAt: new Date()
        })
    // }

    return NextResponse.json(
        data,
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "s-maxage=3600, stale-while-revalidate"
            }
        }
    );
}