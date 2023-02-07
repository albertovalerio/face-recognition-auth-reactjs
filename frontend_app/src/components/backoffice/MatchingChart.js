import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'


export const MatchingChart = (props) => {

    const { photoA, photoB } = props
    ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Legend)

    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            legend: {
                position: 'top'
            }
        },
        scales: {
            x: {
                ticks: {
                    fontSize: "12",
                    fontColor: "#777777",
                },
                grid: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    fontSize: "12",
                    fontColor: "#777777",
                },
                grid: {
                    color: "#D8D8D8",
                    zeroLineColor: "#D8D8D8",
                    borderDash: [2, 2],
                    zeroLineBorderDash: [2, 2],
                    drawBorder: false,
                },
            }
        },
    }

    const data = {
        labels: [...Array(128).keys()],
        datasets: [
            {
                label: 'Face #1',
                data: photoA.faces.length !== 0 ? photoA.faces[0].descriptor : [],
                borderWidth: 3,
                borderColor: "rgb(27 183 190)",
                backgroundColor: "transparent",
                pointBorderColor: "transparent",
            },
            {
                label: 'Face #2',
                data: photoB.faces.length !== 0 ? photoB.faces[0].descriptor : [],
                borderWidth: 3,
                borderColor: "rgb(255 153 31)",
                backgroundColor: "transparent",
                pointBorderColor: "transparent",
            }
        ],
    }
      
    return (
        <Line options={options} data={data} />
    )
}