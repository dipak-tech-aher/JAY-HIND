import React from 'react';
import { Bar } from 'react-chartjs-2';

const rand = () => Math.round(Math.random() * 20 - 10);

const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
        {
            type: 'bar',
            label: 'Upgrade',
            backgroundColor: 'rgb(54, 162, 235)',
            borderWidth: 2,
            fill: false,
            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
           
        },
        {
            type: 'bar',
            label: 'Downgrade',
            backgroundColor: 'rgb(255, 99, 132)',
            data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
            borderColor: 'white',
            borderWidth: 2,
        },
       

    ],
};

const MultiType = () => (
    <>
        
        <Bar data={{}} />
    </>
);

export default MultiType;