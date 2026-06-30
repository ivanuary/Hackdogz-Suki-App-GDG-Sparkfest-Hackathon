async function searchProduct() {

    const product = document.getElementById("product").value;

    const lat = 14.665469930789099;
    const lon = 121.12901637058972;

    try {


        const response = await fetch(
            `/search?product=${product}&lat=${lat}&lon=${lon}`
        );

        
        const data = await response.json();

     
        console.log(data);


        document.getElementById("results").textContent =
            JSON.stringify(data, null, 2);

    }
    catch(error) {

        console.error(error);

        document.getElementById("results").textContent =
            "Something went wrong.";
    }

}