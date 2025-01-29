document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("revenue-estimator");
    const revenueResultDiv = document.getElementById("revenue-result");
    const formattedResultDiv = document.getElementById("formatted-result");

    if (form) {
        form.addEventListener("submit", calculatePrice);
    }

    function calculatePrice(event) {
        event.preventDefault();

        const area = document.getElementById("area").value;
        const bedrooms = document.getElementById("bedrooms").value;
        const furnishing = document.getElementById("furnishing").value;

        if (!area || !bedrooms || !furnishing) {
            alert("Please enter all fields.");
            return;
        }

        const priceData = {
            "Lahore": {
                Studio: 1000,
                "1": 1500,
                "2": 2000,
                "3": 2500,
                "4": 2350,
                Standard: 1200,
                Luxury: 1800,
            },
        };

        let totalRevenue = 0;

        if (priceData[area]) {
            totalRevenue += priceData[area][bedrooms] || 0;
            totalRevenue += priceData[area][furnishing] || 0;
        }

        localStorage.setItem("calculatedPrice", totalRevenue);
        localStorage.setItem("selectedArea", area);
        localStorage.setItem("selectedBedrooms", bedrooms);

        form.reset();

        window.location.href = "/estimate-revenue";
    }

    const calculatedPrice = localStorage.getItem("calculatedPrice");
    const area = localStorage.getItem("selectedArea");
    const bedrooms = localStorage.getItem("selectedBedrooms");

    if (revenueResultDiv) {
        if (calculatedPrice) {
            revenueResultDiv.innerHTML = `Estimated Price: ${calculatedPrice}`;
        } else {
            revenueResultDiv.innerHTML = "No price calculated yet.";
        }
    } 

    if (formattedResultDiv) {
        if (area && bedrooms && calculatedPrice) {
            const formattedResult = `A ${bedrooms} Bed property in ${area} can earn <span class="price">${calculatedPrice}</span> daily on average *`;
            formattedResultDiv.innerHTML = formattedResult;
        }
    } 
});
