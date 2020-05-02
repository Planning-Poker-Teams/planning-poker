<template>
  <canvas id="chart"></canvas>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Chart from 'chart.js';

interface BarData {
  title: string;
  width: string;
  height: string;
  x: string;
}

@Component
export default class BarChart extends Vue {
  @Prop() private estimationData!: {
    value: string;
    names: string[];
  }[];

  get chartLabels(): string[] {
    return this.estimationData.map(e => e.value);
  }

  get chartData(): number[] {
    return this.estimationData.map(e => e.names.length);
  }

  get chartNames(): string[] {
    return this.estimationData.map(e => e.names.join(', '));
  }

  mounted() {
    const myChart = new Chart('chart', {
      type: 'bar',
      data: {
        labels: this.chartLabels,
        datasets: [
          {
            data: this.chartData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        title: { display: true },
        legend: { display: false },
        tooltips: {
          enabled: false,
        },
        scales: {
          xAxes: [
            {
              type: 'category',
              distribution: 'series',
              scaleLabel: {
                display: true,
                labelString: 'Complexity',
                fontSize: 16,
              },
              gridLines: {
                display: true,
              },
            },
          ],
          yAxes: [
            {
              type: 'linear',
              ticks: { beginAtZero: true, stepSize: 1, autoSkip: false },
              scaleLabel: { display: true, labelString: 'Votes', fontSize: 16 },
              gridLines: {
                display: true,
              },
            },
          ],
        },
      },
    });
  }
}
</script>
