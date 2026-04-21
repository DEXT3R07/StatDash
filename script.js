let barChart, pieChart;

const colors = ["#6C8CFF","#7A4DFF","#FF66CC","#00C9A7","#FFC75F"];

function generateCharts() {
  const labels = [];
  const values = [];

  document.querySelectorAll(".row").forEach(row => {
    const name = row.querySelector(".name").value;
    const value = parseFloat(row.querySelector(".value").value);
    if (name && value) {
      labels.push(name);
      values.push(value);
    }
  });

  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  barChart = new Chart(document.getElementById("bar"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 12
      }]
    }
  });

  pieChart = new Chart(document.getElementById("pie"), {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    }
  });

  const total = values.reduce((a,b)=>a+b,0);
  const avg = total/values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const top = labels[values.indexOf(max)];

  document.getElementById("total").innerText = total;
  document.getElementById("avg").innerText = avg.toFixed(2);
  document.getElementById("high").innerText = max;
  document.getElementById("low").innerText = min;
  document.getElementById("top").innerText = top + " ("+max+")";
}

function addRow() {
  document.getElementById("rows").innerHTML += `
    <div class="row">
      <input class="name" placeholder="Name">
      <input class="value" type="number" placeholder="Value">
    </div>`;
}
