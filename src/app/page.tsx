"use client";

import StockChart from "@/components/StockChart";
import { calculateDiffs, calculateMacd, predictPrices } from "@/helpers/SimulationHelper";
import { Alert, Button, Container, Divider, Grid, Link, Paper, Skeleton, Snackbar, TextField, ThemeProvider, Typography, createTheme } from "@mui/material";
import { ChartData } from "chart.js";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import SettingsPanel from "@/components/SettingsPanel";
import { STOCKS } from "./stocks";


const fetcher = (url: URL) => fetch(url).then(r => r.json())

export default function Home() {

    // Stock data
    const [stock, setStock] = useState<string>(STOCKS[0].ticker);
    const { data, error, isLoading } = useSWR(`/api/stocks/${stock}`, fetcher)

    // Simulation settings
    const [numSims, setNumSims] = useState<number>(1_000)
    const [simLength, setSimLength] = useState<number>(100)
    const [percentiles, setPercentiles] = useState<number[]>([50])

    // Datasets
    const [predictionData, setPredictionData] = useState<Map<number, number[]>>();
    const [historicalDataSet, setHistoricalDataSet] = useState<{ x: Date, y: number }[]>()
    const [predicitionDataSets, setPredicitionDataSets] = useState<{ p: number, ds: { x: Date, y: number }[]}[]>()

    const [snackbarIsOpen, setSnackbarIsOpen] = useState<boolean>(false)

    const runSim = async () => {
        // calculateDiffs(data.values)
        // .then((diffs: number[]) => {
        //     return predictPrices(diffs, numSims, simLength, percentiles);
        // })
        // .then((prices: Map<number, number[]>) => {
        //     console.log(prices)
        //     setPredictionData(prices);
        // })
        // .then((diffs) => {
        //    console.log('diffs', diffs)

        calculateMacd(data.prediction.values).then((prices) => {
            setPredictionData(prices);

        }).catch((err: any) => {
                console.error(err);
        });
    }

    useEffect(() => {
        if (!predictionData) return

        let datasets: { p: number; ds: { x: Date; y: number; }[]; }[] = []
        console.log('predictionData', predictionData)
        predictionData.forEach((value, key) => {

            // Get the end date/value for each simulation
            let endDate = new Date(data.values[0].datetime);
            let endValue: number = data.values[0].close;
            let mappedData = value.map((n: number, i: number) => {
                let newDate = new Date()
                newDate.setDate(endDate.getDate() + i)
                return {
                    x: newDate,
                    y: endValue * n
                }
            })

            datasets.push({
                p: key,
                ds: mappedData
            })
        })

        setPredicitionDataSets(datasets)

    }, [predictionData])

    useEffect(() => {
        // Simulate future prices
        if (!data?.values) return;
        setHistoricalDataSet(data.values.map((d: any) => ({ x: new Date(d.datetime), y: d.close })))

        runSim()
    }, [data]);

    const historicalColor = 'rgb(99, 200, 200)'
    const predictionColor = 'rgb(200, 200, 200)'

    let chartData = useMemo(() => {
        let chartData: ChartData<"line", { x: Date, y: number }[], string> = {
            datasets: [
                {
                    label: 'Historical',
                    data: historicalDataSet ?? [],
                    borderColor: historicalColor,
                    backgroundColor: historicalColor,
                }
            ]
        }

        if (predicitionDataSets?.length! > 0) {
            for (let predicition of predicitionDataSets!) {
                chartData.datasets.push({
                    label: `Predicition ${predicition.p}%`,
                    data: predicition.ds,
                    borderColor: predictionColor,
                    backgroundColor: predictionColor,
                })
            }
        }

        return chartData
    }, [historicalDataSet, predicitionDataSets])

    const darkTheme = createTheme({ palette: { mode: 'dark' } })

    return (
        <ThemeProvider theme={darkTheme}>
        <Container maxWidth="md">
            <Typography className="jacquard-12-regular" variant="h1" sx={{ fontSize: 60, textAlign: "center", color: "#fff"}}>
                Stock Sim
            </Typography>

            <Grid container spacing={5} sx={{ mt: 1 }}>
                <Grid item xs={12} md={8}>
                    {isLoading || error ?
                        <Skeleton variant="rounded" sx={{ minHeight: "100%" }} /> :
                        <StockChart data={chartData!} />
                    }
                </Grid>

                <Grid item xs={12} md={4}>
                    <SettingsPanel
                        stock={stock}
                        setStock={setStock}
                        numSims={numSims}
                        setNumSims={setNumSims}
                        simLength={simLength}
                        setSimLength={setSimLength}
                        runOnClick={runSim}
                    />
                </Grid>
            </Grid>

            <Snackbar open={snackbarIsOpen} autoHideDuration={6000} onClose={() => setSnackbarIsOpen(false)}>
                <Alert onClose={() => setSnackbarIsOpen(false)} severity="error" sx={{ width: '100%' }}>
                    There was an error getting stock data: {error}
                </Alert>
            </Snackbar>
        </Container>
        </ThemeProvider>
    )
}
