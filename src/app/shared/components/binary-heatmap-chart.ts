import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

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

@Component({
  selector: 'app-binary-heatmap-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective],
  template: `
    <div
      echarts
      [options]="chartOptions()"
      class="h-36 w-full"
      aria-label="52 hafta davomida sport va maxsus faoliyatni ko'rsatuvchi grafik"
      role="img"
    ></div>
  `,
})
export class BinaryHeatmapChartComponent {
  readonly sport = input.required<number[]>();
  readonly maxsus = input.required<number[]>();

  readonly chartOptions = computed<EChartsOption>(() => {
    const sportData = this.sport();
    const maxsusData = this.maxsus();
    const weeks = Array.from({ length: 52 }, (_, i) => `${i + 1}`);

    // Transform data for heatmap: [weekIndex, rowIndex, value]
    // Use different value ranges: Sport 0-1, Maxsus 2-3
    const heatmapData: [number, number, number][] = [];

    sportData.forEach((value, weekIndex) => {
      heatmapData.push([weekIndex, 0, value]); // 0 = inactive, 1 = active sport
    });

    maxsusData.forEach((value, weekIndex) => {
      heatmapData.push([weekIndex, 1, value + 2]); // 2 = inactive, 3 = active maxsus
    });

    return {
      tooltip: {
        position: 'top',
        formatter: (params: unknown) => {
          const p = params as { data: [number, number, number] };
          const weekIndex = p.data[0];
          const week = weekIndex + 1;
          const month = getMonthForWeek(weekIndex);
          const category = p.data[1] === 0 ? 'Sport o\'yinlari' : 'Maxsus kuch mashqlari';
          const isActive = p.data[1] === 0 ? p.data[2] === 1 : p.data[2] === 3;
          const status = isActive ? '✓ Faol' : '✗ Nofaol';
          return `<strong>${month}, ${week}-hafta</strong><br/>${category}: ${status}`;
        },
      },
      grid: {
        left: '12%',
        right: '2%',
        bottom: '15%',
        top: '5%',
      },
      xAxis: {
        type: 'category',
        data: weeks,
        splitArea: { show: false },
        axisLabel: {
          interval: 3,
          fontSize: 10,
        },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: ['Sport o\'yinlari', 'Maxsus kuch mashqlari'],
        splitArea: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          fontSize: 10,
        },
      },
      visualMap: {
        show: false,
        min: 0,
        max: 3,
        inRange: {
          color: ['#fed7aa', '#f97316', '#e9d5ff', '#a855f7'], // light orange, orange, light purple, purple
        },
      },
      series: [
        {
          type: 'heatmap',
          data: heatmapData,
          itemStyle: {
            borderRadius: 3,
            borderWidth: 2,
            borderColor: '#fff',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 5,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        },
      ],
    };
  });
}
