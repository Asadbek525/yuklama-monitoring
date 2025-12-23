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

// Convert binary sport/maxsus to hours (total 40h sport, 80h maxsus distributed across active weeks)
function convertToHours(data: number[], totalHours: number): number[] {
  const activeCount = data.filter(v => v === 1).length;
  const hoursPerWeek = activeCount > 0 ? totalHours / activeCount : 0;
  return data.map(v => v === 1 ? Number(hoursPerWeek.toFixed(1)) : 0);
}

@Component({
  selector: 'app-workload-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective],
  template: `
    <div
      echarts
      [options]="chartOptions()"
      class="w-full"
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

    // Convert sport and maxsus to hours
    const sportHours = convertToHours(workload.sport, 40);
    const maxsusHours = convertToHours(workload.maxsus, 80);

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
          const p = params as Array<{ seriesName: string; value: number; dataIndex: number; color: string; axisIndex: number }>;
          const weekIndex = p[0].dataIndex;
          const week = weekIndex + 1;
          const month = getMonthForWeek(weekIndex);
          let result = `<strong>${month}, ${week}-hafta</strong><br/>`;
          p.forEach((item) => {
            const isHours = item.seriesName === 'Sport o\'yinlari' || item.seriesName === 'Maxsus kuch mashqlari';
            const unit = isHours ? 'soat' : 'km';
            result += `<span style="color:${item.color}">●</span> ${item.seriesName}: <strong>${item.value} ${unit}</strong><br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['Aerob yuklama', 'Aralash yuklama', 'Anaerob yuklama', 'Sakrashlar', 'Sport o\'yinlari', 'Maxsus kuch mashqlari'],
        top: 0,
        itemGap: 10,
        textStyle: {
          fontSize: 11,
        },
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '2%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: weekLabels,
        axisLabel: {
          interval: 0,
          fontSize: 9,
          rotate: 0,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Masofa (km)',
          nameLocation: 'middle',
          nameGap: 45,
          min: 0,
          interval: 5,
        },
        {
          type: 'value',
          name: 'Vaqt (soat)',
          nameLocation: 'middle',
          nameGap: 45,
          min: 0,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Aerob yuklama',
          type: 'line',
          smooth: true,
          data: workload.aerob,
          yAxisIndex: 0,
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
          yAxisIndex: 0,
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
          yAxisIndex: 0,
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
          yAxisIndex: 0,
          lineStyle: { width: 2 },
          itemStyle: { color: '#3b82f6' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: 'Sport o\'yinlari',
          type: 'line',
          data: sportHours,
          yAxisIndex: 1,
          smooth: true,
          lineStyle: { width: 2 },
          itemStyle: { color: '#f97316' },
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: 'Maxsus kuch mashqlari',
          type: 'line',
          data: maxsusHours,
          yAxisIndex: 1,
          smooth: true,
          lineStyle: { width: 2 },
          itemStyle: { color: '#a855f7' },
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
