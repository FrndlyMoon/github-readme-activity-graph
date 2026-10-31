import { createGraph } from './createChart';
import { graphSvg } from './svgs';
import { Colors, ContributionDay } from './interfaces/interface';

export class Card {
    constructor(
        private readonly height: number,
        private readonly width: number,
        private readonly radius: number,
        private readonly colors: Colors,
        private readonly title = '',
        private readonly area = false,
        private readonly showGrid = true,
    ) {}

    private getOptions(daysCount: number) {
        // Long ranges get at most ~15 x-axis labels so they don't overlap.
        // 31 days or fewer keeps every label, exactly like before.
        // Example: 60 days -> a label every 4th day.
        const labelStep = daysCount > 31 ? Math.ceil(daysCount / 15) : 1;
        const lastIndex = daysCount - 1;

        return {
            width: this.width,
            height: this.height,
            axisY: {
                title: 'Contributions',
                onlyInteger: true,
                offset: 70,
                labelOffset: {
                    y: 4.5,
                },
                low: 0,
                showGrid: this.showGrid,
            },
            axisX: {
                title: 'Days',
                offset: 50,
                labelOffset: {
                    x: -4.5,
                },
                showGrid: this.showGrid,
                // Skipped labels return '' so Chartist leaves them blank.
                // The final (most recent) day is also labelled when it sits far
                // enough from the previous labelled day to avoid overlapping it.
                labelInterpolationFnc: (value: string, index: number) => {
                    if (labelStep === 1 || index % labelStep === 0) return value;
                    if (index === lastIndex && index % labelStep >= Math.ceil(labelStep / 2)) return value;
                    return '';
                },
            },
            chartPadding: {
                top: 80,
                right: 50,
                bottom: 20,
                left: 20,
            },
            showArea: this.area,
            fullWidth: true,
        };
    }

    /** Unused Code ref #85 */
    // private getContrubutionDates() {
    //     const days = [];
    //     for (const date = new Date(); days.length < 31; date.setDate(date.getUTCDate() - 1)) {
    //         const current = new Date(date);
    //         days.push(
    //             current.toLocaleString('default', { month: 'short' }) +
    //                 ' ' +
    //                 current.getUTCDate().toString()
    //         );
    //     }

    //     return days.reverse();
    // }

    async buildGraph(days: ContributionDay[]): Promise<string> {
        //Options to pass in createGraph function
        const options = this.getOptions(days.length);

        //Construction of graph from node-chartist
        const line: Promise<string> = await createGraph('line', options, {
            labels: days.map((day) => day.date),
            series: [{ value: days.map((day) => day.contributionCount) }],
        });

        //Arguments to construct graphs with rect and other options
        const args = {
            height: this.height,
            width: this.width,
            colors: this.colors,
            title: this.title,
            radius: this.radius,
            line,
        };

        return graphSvg(args);
    }
}
