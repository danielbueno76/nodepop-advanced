const filterByField = (name, price, sale, tags, username) => {
  const filter = {};
  if (name) {
    filter.name = new RegExp(name, "i");
  }

  if (price) {
    let pricesArray = [];
    if (Array.isArray(price)) {
      pricesArray = price;
    } else if (price.search("-") !== -1) {
      pricesArray = price.split("-");
    } else {
      filter.price = price;
    }

    if (pricesArray[0] === "") {
      filter.price = { $lte: pricesArray[1] };
    } else if (pricesArray[1] === "") {
      filter.price = { $gte: pricesArray[0] };
    } else if (pricesArray[0] !== "" && pricesArray[1] !== "") {
      filter.price = { $gte: pricesArray[0], $lte: pricesArray[1] };
    }
  }

  if (sale) {
    filter.sale = sale;
  }

  if (tags) {
    filter.tags = { $in: tags };
  }

  if (username) {
    filter.username = username;
  }

  return filter;
};

module.exports = {
  filterByField,
};
