import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { WorkloadData } from '../../models/workload.model';

// Month distribution: Sept(4), Oct(5), Nov(4), Dec(4), Jan(5), Feb(4), Mar(4), Apr(4), May(5), Jun(4), Jul(5), Aug(4)
const MONTHS = [
  { name: 'Sentyabr', weeks: 4 },
  { name: 'Oktyabr', weeks: 5 },
  { name: 'Noyabr', weeks: 4 },
  { name: 'Dekabr', weeks: 4 },
  { name: 'Yanvar', weeks: 5 },
  { name: 'Fevral', weeks: 4 },
  { name: 'Mart', weeks: 4 },
  { name: 'Aprel', weeks: 4 },
  { name: 'May', weeks: 5 },
  { name: 'Iyun', weeks: 4 },
  { name: 'Iyul', weeks: 5 },
  { name: 'Avgust', weeks: 4 },
];

function getMonthForWeek(weekIndex: number): string {
  let cumulative = 0;
  for (const month of MONTHS) {
    cumulative += month.weeks;
    if (weekIndex < cumulative) {
      return month.name;
    }
  }
  return MONTHS[MONTHS.length - 1].name;
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
      class="h-[400px] w-full"
      aria-label="52 hafta davomida aerob, aralash, anaerob va sakrash qiymatlarini ko'rsatuvchi yuklama chiziqli grafigi"
      role="img"
    ></div>
  `,
})
export class WorkloadLineChartComponent {
  readonly data = input.required<WorkloadData>();

  readonly chartOptions = computed<EChartsOption>(() => {
    const workload = this.data();
    const weeks = Array.from({ length: 52 }, (_, i) => `${i + 1}`);
    const monthBoundaries = getMonthBoundaries();

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
          const p = params as Array<{ seriesName: string; value: number; dataIndex: number; color: string }>;
          const weekIndex = p[0].dataIndex;
          const week = weekIndex + 1;
          const month = getMonthForWeek(weekIndex);
          let result = `<strong>${month}, ${week}-hafta</strong><br/>`;
          p.forEach((item) => {
            result += `<span style="color:${item.color}">●</span> ${item.seriesName}: <strong>${item.value} km</strong><br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['Aerob yuklama', 'Aralash yuklama', 'Anaerob yuklama', 'Sakrashlar'],
        top: 0,
        itemGap: 15,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '18%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: weeks,
        name: 'Hafta',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          interval: 3,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Masofa (km)',
        nameLocation: 'middle',
        nameGap: 50,
      },
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: 100,
          bottom: 10,
          height: 25,
        },
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: 'Aerob yuklama',
          type: 'line',
          smooth: true,
          data: workload.aerob,
          lineStyle: { width: 2 },
          itemStyle: { color: '#22c55e' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            focus: 'series',
          },
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
          lineStyle: { width: 2 },
          itemStyle: { color: '#eab308' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: 'Anaerob yuklama',
          type: 'line',
          smooth: true,
          data: workload.anaerob,
          lineStyle: { width: 2 },
          itemStyle: { color: '#ef4444' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: 'Sakrashlar',
          type: 'line',
          smooth: true,
          data: workload.sakrash,
          lineStyle: { width: 2 },
          itemStyle: { color: '#3b82f6' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
  });
}

