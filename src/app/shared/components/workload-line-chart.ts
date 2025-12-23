import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { WorkloadData } from '../../models/workload.model';

// Month distribution: Sept(4), Oct(5), Nov(4), Dec(4), Jan(5), Feb(4), Mar(4), Apr(4), May(5), Jun(4), Jul(5), Aug(4)
const MONTHS = [
  { name: 'Sen', weeks: 4 },
  { name: 'Okt', weeks: 5 },
  { name: 'Noy', weeks: 4 },
  { name: 'Dek', weeks: 4 },
  { name: 'Yan', weeks: 5 },
  { name: 'Fev', weeks: 4 },
  { name: 'Mar', weeks: 4 },
  { name: 'Apr', weeks: 4 },
  { name: 'May', weeks: 5 },
  { name: 'Iyn', weeks: 4 },
  { name: 'Iyl', weeks: 5 },
  { name: 'Avg', weeks: 4 },
];

const MONTHS_FULL = [
  'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr', 'Yanvar', 'Fevral',
  'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust'
];

function getMonthForWeek(weekIndex: number): string {
  let cumulative = 0;
  for (let i = 0; i < MONTHS.length; i++) {
    cumulative += MONTHS[i].weeks;
    if (weekIndex < cumulative) {
      return MONTHS_FULL[i];
    }
  }
  return MONTHS_FULL[MONTHS_FULL.length - 1];
}

function getWeekLabels(): string[] {
  const labels: string[] = [];
  let weekNum = 1;
  for (const month of MONTHS) {
    for (let i = 0; i < month.weeks; i++) {
      if (i === 0) {
        labels.push(`${month.name}`);
      } else {
        labels.push(`${weekNum}`);
      }
      weekNum++;
    }
  }
  return labels;
}

function getMonthBoundaries(): number[] {
  const boundaries: number[] = [];
  let cumulative = 0;
  for (const month of MONTHS) {
    cumulative += month.weeks;
    if (cumulative < 52) {
      boundaries.push(cumulative - 1);
    }
  }
  return boundaries;
}

@Component({
  selector: 'app-workload-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective],
  template: `
    <div
      echarts
      [options]="chartOptions()"
      class="h-[480px] w-full"
      aria-label="52 hafta davomida aerob, aralash, anaerob va sakrash qiymatlarini ko'rsatuvchi yuklama chiziqli grafigi"
      role="img"
    ></div>
  `,
})
export class WorkloadLineChartComponent {
  readonly data = input.required<WorkloadData>();

  readonly chartOptions = computed<EChartsOption>(() => {
    const workload = this.data();
    const weekLabels = getWeekLabels();
    const monthBoundaries = getMonthBoundaries();

    // Create heatmap data for sport and maxsus
    // Use different value ranges: Sport 0-1, Maxsus 2-3
    const sportHeatmap: [number, number, number][] = workload.sport.map((v, i) => [i, 0, v]);
    const maxsusHeatmap: [number, number, number][] = workload.maxsus.map((v, i) => [i, 1, v + 2]);
    const heatmapData = [...sportHeatmap, ...maxsusHeatmap];

    // Create mark lines for month boundaries
    const markLineData = monthBoundaries.map((weekIndex) => ({
      xAxis: weekIndex,
      lineStyle: {
        type: 'dashed' as const,
        color: '#d1d5db',
        width: 1,
      },
      label: {
        show: false,
      },
    }));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: unknown) => {
          const p = params as Array<{ seriesName: string; value: number | [number, number, number]; dataIndex: number; color: string; componentSubType: string }>;
          const weekIndex = p[0].dataIndex;
          const week = weekIndex + 1;
          const month = getMonthForWeek(weekIndex);
          let result = `<strong>${month}, ${week}-hafta</strong><br/>`;
          p.forEach((item) => {
            if (item.componentSubType === 'heatmap') {
              const val = item.value as [number, number, number];
              const name = val[1] === 0 ? 'Sport o\'yinlari' : 'Maxsus kuch mashqlari';
              const isActive = val[1] === 0 ? val[2] === 1 : val[2] === 3;
              const status = isActive ? '✓' : '✗';
              result += `<span style="color:${item.color}">●</span> ${name}: ${status}<br/>`;
            } else {
              result += `<span style="color:${item.color}">●</span> ${item.seriesName}: <strong>${item.value} km</strong><br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        data: ['Aerob yuklama', 'Aralash yuklama', 'Anaerob yuklama', 'Sakrashlar'],
        top: 0,
        itemGap: 15,
        textStyle: {
          fontSize: 11,
        },
      },
      grid: [
        {
          left: '3%',
          right: '3%',
          top: '8%',
          height: '65%',
          containLabel: true,
        },
        {
          left: '3%',
          right: '3%',
          top: '82%',
          height: '12%',
          containLabel: true,
        },
      ],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: weekLabels,
          gridIndex: 0,
          axisLabel: {
            interval: 0,
            fontSize: 9,
          },
        },
        {
          type: 'category',
          data: weekLabels,
          gridIndex: 1,
          axisLabel: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'km',
          nameLocation: 'middle',
          nameGap: 35,
          min: 0,
          interval: 5,
          gridIndex: 0,
        },
        {
          type: 'category',
          data: ['Sport o\'yinlari', 'Maxsus kuch mashqlari'],
          gridIndex: 1,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            fontSize: 9,
          },
        },
      ],
      visualMap: {
        show: false,
        min: 0,
        max: 3,
        inRange: {
          color: ['#fed7aa', '#f97316', '#e9d5ff', '#a855f7'], // light orange, orange, light lilac, lilac
        },
        seriesIndex: 4,
      },
      series: [
        {
          name: 'Aerob yuklama',
          type: 'line',
          smooth: true,
          data: workload.aerob,
          xAxisIndex: 0,
          yAxisIndex: 0,
          lineStyle: { width: 2 },
          itemStyle: { color: '#22c55e' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: { focus: 'series' },
          markLine: {
            silent: true,
            symbol: 'none',
            data: markLineData,
          },
        },
        {
          name: 'Aralash yuklama',
          type: 'line',
          smooth: true,
          data: workload.aralash,
          xAxisIndex: 0,
          yAxisIndex: 0,
          lineStyle: { width: 2 },
          itemStyle: { color: '#eab308' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: { focus: 'series' },
        },
        {
          name: 'Anaerob yuklama',
          type: 'line',
          smooth: true,
          data: workload.anaerob,
          xAxisIndex: 0,
          yAxisIndex: 0,
          lineStyle: { width: 2 },
          itemStyle: { color: '#ef4444' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: { focus: 'series' },
        },
        {
          name: 'Sakrashlar',
          type: 'line',
          smooth: true,
          data: workload.sakrash,
          xAxisIndex: 0,
          yAxisIndex: 0,
          lineStyle: { width: 2 },
          itemStyle: { color: '#3b82f6' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: { focus: 'series' },
        },
        {
          name: 'Activity',
          type: 'heatmap',
          data: heatmapData,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            borderRadius: 2,
            borderWidth: 1,
            borderColor: '#fff',
          },
        },
      ],
    };
  });
}
