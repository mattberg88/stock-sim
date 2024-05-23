import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData, TimeScale, LineControllerChartOptions } from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { enGB } from "date-fns/locale";
import "chartjs-adapter-date-fns";

ChartJS.register(
    CategoryScale,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
ChartJS.defaults.color = 'rgb(180,180,180)'
ChartJS.defaults.borderColor = 'rgb(150,150,150)'
ChartJS.defaults.font.family = "Helvetica";


export default function StockChart(props: { data: ChartData<"line", { x: Date, y: number }[], string> }) {

    const options = useMemo<any>(() => {
        return {
            defaultFontFamily: 'Times',
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                    },
                    adaptors: {
                        date: {
                            locale: enGB
                        }
                    }
                },
                y: {
                    type: 'linear',
                    min: 0,
                },
            },
            elements: {
                point: {
                    pointStyle: false
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest',
                axis: 'x'
            },
            plugins: {
                legend: {
                    position: 'top' as const,
                },
            },
        };
    }, []);


    return (
        <Line
            options={options}
            data={props.data}
        />
    )
}
