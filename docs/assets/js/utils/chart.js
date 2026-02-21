export function renderLineChart(canvas, labels, data, label, existingChart) {
    if (existingChart) {
        existingChart.destroy();
    }
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Unable to initialize chart context.");
    }
    return new Chart(context, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label,
                    data,
                    borderColor: "#1f7a8c",
                    backgroundColor: "rgba(31, 122, 140, 0.2)",
                    tension: 0.35,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}
export function renderBarChart(canvas, labels, data, label, existingChart) {
    if (existingChart) {
        existingChart.destroy();
    }
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Unable to initialize chart context.");
    }
    return new Chart(context, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label,
                    data,
                    backgroundColor: "rgba(31, 122, 140, 0.75)",
                    borderColor: "#1f7a8c",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}
//# sourceMappingURL=chart.js.map