import { TooltipItem } from 'chart.js';
import Chart from 'chart.js/auto';
import { RefObject, useEffect } from 'react';

/**
 * Custom hook to initialize a bar chart
 */
export const useBarChart = (
    chartRef: RefObject<HTMLCanvasElement | null>,
    data: {
        labels: string[];
        values: number[];
    },
    options?: {
        backgroundColor?: string;
        borderColor?: string;
        barThickness?: number;
    },
) => {
    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: 'Count',
                                data: data.values,
                                backgroundColor: options?.backgroundColor || 'rgba(79, 70, 229, 0.7)',
                                borderColor: options?.borderColor || 'rgba(79, 70, 229, 1)',
                                borderWidth: 1,
                                borderRadius: 6,
                                barThickness: options?.barThickness || 20,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                callbacks: {
                                    title: (tooltipItems) => {
                                        const index = tooltipItems[0].dataIndex;
                                        return data.labels[index];
                                    },
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    display: true,
                                    color: 'rgba(0, 0, 0, 0.05)',
                                },
                                ticks: {
                                    precision: 0,
                                },
                            },
                            x: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                    },
                });

                return () => {
                    chart.destroy();
                };
            }
        }
    }, [chartRef, data, options]);
};

/**
 * Custom hook to initialize a line chart for revenue data
 */
export const useRevenueChart = (
    chartRef: RefObject<HTMLCanvasElement | null>,
    data: {
        labels: string[];
        values: number[];
    },
) => {
    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: 'Revenue',
                                data: data.values,
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderColor: 'rgba(16, 185, 129, 1)',
                                borderWidth: 2,
                                tension: 0.3,
                                fill: true,
                                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                                pointRadius: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (tooltipItem: TooltipItem<'line'>) {
                                        return `Revenue: $${(tooltipItem.raw as number).toFixed(2)}`;
                                    },
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    display: true,
                                    color: 'rgba(0, 0, 0, 0.05)',
                                },
                                ticks: {
                                    callback: (value) => {
                                        return `$${value}`;
                                    },
                                },
                            },
                            x: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                    },
                });

                return () => {
                    chart.destroy();
                };
            }
        }
    }, [chartRef, data]);
};
