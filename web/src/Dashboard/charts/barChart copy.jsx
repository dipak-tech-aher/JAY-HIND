import React, { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";
import { useState } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, ChartDataLabels);

const VerticalBar = (props) => {
  let { topSales } = props.data;
  let response = topSales.reduce((acc, item) => {
    const channel = item.channel.toLowerCase();
    const entity = item.entity;

    const existingItem = acc.find((entry) => entry.channel === channel && entry.entity === entity);

    if (existingItem) {
      existingItem.count++;
    } else {
      acc.push({ count: 1, channel, entity });
    }

    return acc;
  }, []);

  const groupBy = (items, key) =>
    items.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [...(result[item[key]] || []), item],
      }),
      {}
    );

  if (response?.length) {
    response?.map((x) => {
      if (!x.channel) x.channel = "Unknown";
      return x;
    });
    response = groupBy(response, "channel");
  }

  let labels = [];
  let intxnData = [];
  let orderData = [];

  for (const channel in response) {
    labels.push(channel);
    let result = response[channel];
    let intxnCount = '';
    let orderCount = '';

    Array.isArray(result) && result?.length > 0 && result?.map((e) => {
      if (e.entity === "Interactions") {
        intxnCount += e.count == 0 || e.count == '0' ? '' : e?.count;
      } else if (e.entity === "Order") {
        orderCount += e.count == 0 || e.count == '0' ? '' : e?.count;
      }
    });

    intxnData.push(intxnCount);
    orderData.push(orderCount);
  }

  var barChartData = {
    labels: labels,
    datasets: [
      {
        label: "Interaction",
        backgroundColor: "rgb(145,204,117)",
        data: intxnData,
        barPercentage: 0.8, // Adjust the value as per your preference
      },
      {
        label: "Order",
        backgroundColor: "rgb(84,112,198)",
        data: orderData,
        barPercentage: 0.8, // Adjust the value as per your preference
      },
    ],
  };
  
  const options = {
    indexAxis: "y", // Display as a vertical bar chart
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
          stroke: {
            show: true,
            width: 1,
            colors: ["#fff"],
          },
        },
      ],
    },
  };
  
  return (
    <>
      <Bar data={barChartData} options={options} />
    </>
  );
};

export default VerticalBar;