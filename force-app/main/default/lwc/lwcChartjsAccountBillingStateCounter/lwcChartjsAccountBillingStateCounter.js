import { LightningElement, api, wire } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/ChartJs';
import getCounts from '@salesforce/apex/AggregatedStateAccountCounts.getCounts';

const generateRandomNumber = () => {
  return Math.round(Math.random() * 100);
};

export default class LwcChartjs extends LightningElement {
    error;
    chart;
    chartjsInitialized = false;
    data;
    config = {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: [
                    ],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)'
                    ],
                    label: 'Dataset 1'
                }
            ],
            labels: ['Red', 'Orange', 'Yellow', 'stateCounts', 'Blue']
        },
        options: {
            responsive: true,
            legend: {
                position: 'right'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };
    
    @wire(getCounts)
    stateCountFunc({error, data}) {
        if (error) {
            this.error = error;
            this.config = undefined;
        } else if (data){
            console.log('data => ', data);
            this.data = data;
        }
    }

    renderedCallback() {
        if (this.chartjsInitialized) {
            return;
        }
        this.chartjsInitialized = true;

        Promise.all([
            loadScript(this, chartjs + '/Chart.min.js'),
            loadStyle(this, chartjs + '/Chart.min.css')
        ]).then(() => {
                this.config.data.datasets[0].data = [20,20,20,30,50];
                // disable Chart.js CSS injection
                window.Chart.platform.disableCSSInjection = true;

                const canvas = document.createElement('canvas');
                this.template.querySelector('div.chart').appendChild(canvas);
                const ctx = canvas.getContext('2d');
                this.chart = new window.Chart(ctx, this.config);
            })
            .catch((error) => {
                this.error = error;
            });
    }
}