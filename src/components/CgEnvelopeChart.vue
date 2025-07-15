<script setup lang="ts">
import { defineProps, watch, ref } from 'vue';
import { Chart, registerables } from 'chart.js';
import { Scatter } from 'vue-chartjs';
Chart.register(...registerables);

const props = defineProps<{
  envelope: { x: number; y: number }[];
  current: { x: number; y: number };
}>();

const chartData = ref({
  datasets: [
    {
      label: 'Envelope',
      data: props.envelope,
      showLine: true,
      fill: true,
      backgroundColor: 'rgba(0,128,0,0.2)',
      borderColor: 'rgba(0,255,0,0.7)',
      pointRadius: 0,
      order: 1,
    },
    {
      label: 'Current',
      data: [props.current],
      pointStyle: 'cross',
      pointRadius: 8,
      borderColor: 'red',
      backgroundColor: 'red',
      showLine: false,
      order: 2,
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      type: 'linear' as const,
      title: { display: true, text: 'CG (inches)' },
      min: 82, max: 97,
      grid: { color: '#444' },
      ticks: { color: '#fff' },
    },
    y: {
      type: 'linear' as const,
      title: { display: true, text: 'Gross Weight (lbs)' },
      min: 1200, max: 2250,
      grid: { color: '#444' },
      ticks: { color: '#fff' },
    },
  },
});

watch(
  () => [props.envelope, props.current],
  () => {
    chartData.value.datasets[0].data = props.envelope;
    chartData.value.datasets[1].data = [props.current];
  },
  { deep: true }
);
</script>

<template>
  <div style="height: 300px; width: 100%;">
    <Scatter :data="chartData" :options="chartOptions" />
  </div>
</template> 