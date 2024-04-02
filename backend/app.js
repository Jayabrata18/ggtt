const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.post("/calculate", (req, res) => {
  const products = req.body;

 // Calculate total weight and total price
let totalWeight = 0;
let totalPrice = 0;
products.forEach((product) => {
  totalWeight += product.weight;
  totalPrice += product.price;
});

let courierPrice = 0;
let packages = [];

// Check if total price exceeds $250
if (totalPrice > 250) {
  // Calculate number of packages required
  const numPackages = Math.ceil(totalPrice / 250);

  // Calculate weight per package
  const weightPerPackage = Math.ceil(totalWeight / numPackages);

  // Distribute items into packages
  let remainingProducts = [...products];
  for (let i = 1; i <= numPackages; i++) {
    let currentPackage = {
      packageNumber: i,
      items: [],
      totalWeight: 0,
      totalPrice: 0,
      courierPrice: 0,
    };

    // Iterate over remaining products to fill the package
    for (let j = remainingProducts.length - 1; j >= 0; j--) {
      const product = remainingProducts[j];
      if (
        currentPackage.totalPrice + product.price <= 250 &&
        currentPackage.totalWeight + product.weight <= weightPerPackage
      ) {
        // Add item number to the product
        product.itemNumber = products.indexOf(product) + 1;
        currentPackage.items.push({...product}); // Push the product itself
        currentPackage.totalWeight += product.weight;
        currentPackage.totalPrice += product.price;
        remainingProducts.splice(j, 1); // Remove product from remaining products
      }
    }

    // Calculate courier price for the package
    if (currentPackage.totalWeight <= 200) {
      currentPackage.courierPrice = 5;
    } else if (currentPackage.totalWeight <= 500) {
      currentPackage.courierPrice = 10;
    } else if (currentPackage.totalWeight <= 1000) {
      currentPackage.courierPrice = 15;
    } else if (currentPackage.totalWeight <= 5000) {
      currentPackage.courierPrice = 20;
    }

    // If the total price of the package is above $250, set courier price to 0
    if (currentPackage.totalPrice > 250) {
      currentPackage.courierPrice = 0;
    }

    packages.push(currentPackage);
  }
} else {
  // If total price is not over $250, create a single package
  let package1 = {
    packageNumber: 1,
    items: products.map((product, index) => ({ ...product, itemNumber: index + 1 })),
    totalWeight,
    totalPrice,
    courierPrice: 0,
  };

  // Calculate courier price for the single package
  if (totalWeight <= 200) {
    package1.courierPrice = 5;
  } else if (totalWeight <= 500) {
    package1.courierPrice = 10;
  } else if (totalWeight <= 1000) {
    package1.courierPrice = 15;
  } else if (totalWeight <= 5000) {
    package1.courierPrice = 20;
  }

  packages.push(package1);
}

// Return the result as JSON
res.json(packages);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
