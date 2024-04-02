const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.post("/calculate", (req, res) => {
  const products = req.body;

  let totalWeight = 0;
  let totalPrice = 0;
  products.forEach((product) => {
    totalWeight += product.weight;
    totalPrice += product.price;
  });

  let courierPrice = 0;
  let packages = [];

  if (totalPrice > 250) {
    const numPackages = Math.ceil(totalPrice / 250);
    const weightPerPackage = Math.ceil(totalWeight / numPackages);
    let remainingProducts = [...products];
    for (let i = 1; i <= numPackages; i++) {
      let currentPackage = {
        packageNumber: i,
        items: [],
        totalWeight: 0,
        totalPrice: 0,
        courierPrice: 0,
      };

      for (let j = remainingProducts.length - 1; j >= 0; j--) {
        const product = remainingProducts[j];
        if (
          currentPackage.totalPrice + product.price <= 250 &&
          currentPackage.totalWeight + product.weight <= weightPerPackage
        ) {
          currentPackage.items.push("item " + product.id);
          currentPackage.totalWeight += product.weight;
          currentPackage.totalPrice += product.price;
          remainingProducts.splice(j, 1);
        }
      }

      if (currentPackage.totalWeight <= 200) {
        currentPackage.courierPrice = 5;
      } else if (currentPackage.totalWeight <= 500) {
        currentPackage.courierPrice = 10;
      } else if (currentPackage.totalWeight <= 1000) {
        currentPackage.courierPrice = 15;
      } else if (currentPackage.totalWeight <= 5000) {
        currentPackage.courierPrice = 20;
      }

      if (currentPackage.totalPrice > 250) {
        currentPackage.courierPrice = 0;
      }

      packages.push(currentPackage);
    }
  } else {
    let package1 = {
      packageNumber: 1,
      items: products.map((product) => "item " + product.id),
      totalWeight,
      totalPrice,
      courierPrice: 0,
    };

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

  res.json(packages);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
