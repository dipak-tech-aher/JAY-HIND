import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
var labelOption = {
    show: true,
    position: 'insideBottom',
    distance: 15,
    align: 'left',
    verticalAlign: 'middle',
    rotate: 90,
    formatter: '{c}  {name|{a}}',
    fontSize: 16,
    rich: {
        name: {
        }
    }
};

const data = {
    labels: ['Plan', 'Catalogue'],
    datasets: [
        {
            label: 's1',
            data: [320, 332,],
            backgroundColor: 'rgb(128,0,128)',

        },
        {
            label: 's2',
            data: [220, 182],
            backgroundColor: 'rgb(50, 205, 50)',
        },
        {
            label: 's3',
            data: [150, 232, 201, 154, 190],
            backgroundColor: 'rgb(234, 206, 9)',
        },

        {
            label: 's4',
            data: [98, 77, 101, 99, 40],
            backgroundColor: 'rgb(255, 127, 80)',
        },
        {
            label: 's5',
            data: [98, 77, 101, 99, 40],
            backgroundColor: 'rgb(0, 0, 139)',
        },
        {
            label: 's6',
            data: [98, 77, 101, 99, 40],
            backgroundColor: 'rgb(75, 192, 192)',
        }
    ],
};

const options = {
    scales: {
        yAxes: [
            {
                ticks: {
                    beginAtZero: true,
                },
            },
        ],
    },
};

const GroupedBar = (props) => {

    // const { data = [] } = props.data

    const [data, setData] = useState(props.data)
    console.log(data)
    useEffect(() => {
        getData(data)
    }, [])
    const getData = (x) => {
        let labels = [...new Set(x.map(e => e.type))]
        console.log(labels)
        let label = [...new Set(x.map(e => e.connectionType))]
        console.log(label)
    }
    return (
        <>

            <Bar data={data} options={options} />
        </>
    )
};

export default GroupedBar;