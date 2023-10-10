import * as echarts from 'echarts';
import React, { useContext, useEffect, useRef } from 'react';
import { salesDashboardContext } from "../../../AppContext";

const Funnel = (props) => {
  const { getter } = useContext(salesDashboardContext);
  const { leadsPipeline } = getter;
  const { width, height } = props?.chartStyle;
  const chartRef = useRef(null)
  const myChart = useRef(null)

  useEffect(() => {
    // const chartDom = chartRef.current;
    myChart.current = echarts.init(chartRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const option = {

      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c}%'
      },
      toolbox: {
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {}
        }
      },
      legend: {
        data: ['Proposal', 'Qualified', 'Closed', 'Scheduled']
      },
      series: [
        {
          name: 'Expected',
          type: 'funnel',
          left: '10%',
          width: '80%',
          label: {
            formatter: '{b}'
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            opacity: 0.7
          },
          emphasis: {
            label: {
              position: 'inside',
              formatter: '{b}: {c}%'
            }
          },
          data: [
            { value: leadsPipeline?.[0]?.eProspectCustomer??0, name: 'Proposal' },
            { value: leadsPipeline?.[0]?.eQualifiedCustomer??0, name: 'Qualified' },
            { value: leadsPipeline?.[0]?.eClosedDeals??0, name: 'Closed' },
            { value: leadsPipeline?.[0]?.eScheduledAppointment??0, name: 'Scheduled' }
          ]
        },
        {
          name: 'Actual',
          type: 'funnel',
          left: '10%',
          width: '80%',
          maxSize: '80%',
          label: {
            position: 'inside',
            formatter: '{c}%',
            color: '#fff'
          },
          itemStyle: {
            opacity: 0.5,
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            label: {
              position: 'inside',
              formatter: '{b}: {c}%'
            }
          },
          data: [
            { value: leadsPipeline?.[0]?.vProspectCustomer??0, name: 'Proposal' },
            { value: leadsPipeline?.[0]?.vQualifiedCustomer??0, name: 'Qualified' },
            { value: leadsPipeline?.[0]?.vClosedDeals??0, name: 'Closed' },
            { value: leadsPipeline?.[0]?.vScheduledAppointment??0, name: 'Scheduled' }
          ],
          // Ensure outer shape will not be over inner shape when hover.
          z: 100
        }
      ]
    }

    if (option && typeof option === 'object') {
      myChart.current.setOption(option);
    }

    const cleanup = () => {
      myChart.current.dispose();
    };

    return cleanup
  }, [leadsPipeline])

  return <div ref={chartRef} style={{ width, height }}></div>;
}

export default Funnel;