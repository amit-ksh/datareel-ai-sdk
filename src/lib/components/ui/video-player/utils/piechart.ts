export default `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
    <style>
      * {
        box-sizing: border-box;
      }
      html, body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        margin: 0;
        font-family: "Roboto", Arial, sans-serif;
      }
      #chartContainer {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }
      #pieChart {
        max-width: 100%;
        max-height: 100%;
      }
    </style>
  </head>

  <body>
    <div id="chartContainer">
      <canvas id="pieChart"></canvas>
    </div>

    <script>
      const innerLabel = {
        id: "innerLabel",
        afterDatasetDraw(chart, args, pluginOptions) {
          const { ctx } = chart;
          const meta = args.meta;
          const xCoor = meta.data[0].x;
          const yCoor = meta.data[0].y;
          const total = chart.data.datasets[0].data.reduce(
            (acc, cur) => acc + cur,
            0
          );
          ctx.save();
          ctx.textAlign = "center";
          ctx.font = \`bolder 1.25rem 'Open Sans', 'Roboto', 'Arial', sans-serif\`;
          ctx.fillText(\`Total - \${total}\`, xCoor, yCoor);
          ctx.restore();
        },
      };

      const legendSpacing = {
        id: "increase-legend-spacing",
        beforeInit: function (chart) {
          const originalFit = chart.legend.fit;
          chart.legend.fit = function fit() {
            originalFit.bind(chart.legend)();
            this.height += 25;
          };
        },
        // Add a new hook that runs after the chart area is established
        beforeLayout: function(chart) {
          // Add additional padding through options instead of directly manipulating chartArea
          if (chart.legend.options.position === 'top') {
            chart.options.layout.padding.top -= 30;
          } else if (chart.legend.options.position === 'bottom') {
            chart.options.layout.padding.bottom += 20;
          }
        }
      };

      // Function to resize chart on window resize
      window.addEventListener("resize", () => {
        pieChart.resize();
      });

      const ctx = document.getElementById("pieChart").getContext("2d");
      Chart.register(ChartDataLabels);
      const pieChart = new Chart(ctx, {
        plugins: [innerLabel, legendSpacing],
        type: "doughnut",
        data: {
          labels: [],
          datasets: [
            {
              label: "",
              data: [],
              backgroundColor: [
                "#2d98da",
                "#45aaf2",
                "#4b7bec",
                "#3867d6",
                "#8854d0",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          animation: {
              duration: 6000,
          },
          maintainAspectRatio: true,
          responsive: true,
          layout: {
            padding: {
              top: 40,
              right: 60,
              bottom: 40,
              left: 60
            }
          },
          plugins: {
            datalabels: {
              color: "#000000",
              anchor: "end",
              align: "end",
              font: {
                weight: "bold",
                size: Math.max(10, window.innerWidth / 80),
                family: \`'Roboto', 'Arial', sans-serif\`,
              },
              formatter: (val, ctx) => [
                ctx.chart.data.labels[ctx.dataIndex],
                val,
              ],
            },
            legend: {
              position: "top",
              labels: {
                font: {
                  weight: "bold",
                  size: Math.max(10, window.innerWidth / 80),
                  family: \`'Roboto', 'Arial', sans-serif\`,
                },
                color: "#000000",
              },
              padding: 0 // Add more padding to legend
            },
            // tooltip: {
            //   enabled: true,
            // },
          },
        },
      });

      window.addEventListener("message", (event) => {
        if (event.data.type === "toggleAnimation") {
          const animations = document.querySelectorAll(".animatable");
          if (event.data.playing) {
            pieChart.options.plugins.legend.display = true; 
            pieChart.update();
          } else {
           pieChart.stop();
          }
        }
      });
    </script>
  </body>
</html>
`;
