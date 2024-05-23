import { STOCKS } from "@/app/stocks";
import { NextResponse } from "next/server";

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