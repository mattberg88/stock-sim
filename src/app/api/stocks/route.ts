import { NextResponse } from "next/server";

const STOCKS = [
    { name: "MicroSectors FANG Index -3X", ticker: "FNGD"},
    { name: "MacroGenics", ticker: "MGNX" },
    { name: "GameStop", ticker: "GME" },
    { name: "AMC", ticker: "AMC" }

]

export async function GET(req: Request) {
    return NextResponse.json(
        STOCKS,
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "s-maxage=3600, stale-while-revalidate"
            }
        }
    );
}