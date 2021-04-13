import { LightningElement, api, wire, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/ChartJs';
import getCounts from '@salesforce/apex/AggregatedStateAccountCounts.getCounts';

const generateRandomNumber = () => {
  return Math.round(Math.random() * 100);
};

const dynamicColors = () => {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
 };

export default class LwcChartjs extends LightningElement {
    error;
    chart;
    chartjsInitialized = false;
    @track records;
    chartCountsData;
    chartLabel;
    chartColor;
    config = {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                    label: 'Dataset 1'
                }
            ],
            labels: []
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
            console.log('getCounts data => ', data);
            this.records = data;
            let chartCountsData = [];
            let chartLabel = [];
            let chartColor = [];
            let color;
            data.forEach(acc => {
                chartCountsData.push(acc.expr0);
                if(acc.BillingState == undefined){
                    chartLabel.push("undefined");
                }
                if(acc.BillingState != undefined){
                    chartLabel.push(acc.BillingState);
                }
                color = dynamicColors();
                chartColor.push(color);
            });
            this.chartCountsData = chartCountsData;
            this.chartLabel = chartLabel;
            this.chartColor = chartColor;
            this.config.data.datasets[0].data = this.chartCountsData;
            this.config.data.datasets[0].backgroundColor = this.chartColor;
            this.config.data.labels = this.chartLabel;
        }
    }

    renderedCallback() {
        /* make renderedCallback only run 1 time.
        if (this.chartjsInitialized) {
            return;
        }
        this.chartjsInitialized = true;
        */
        Promise.all([
            loadScript(this, chartjs + '/Chart.min.js'),
            loadStyle(this, chartjs + '/Chart.min.css')
        ]).then(() => {
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