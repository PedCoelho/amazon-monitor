function stringToN(string) {
  return Number(
    string
      .replace(".", "")
      .replace(",", ".")
      .replace(/[^0-9\.-]+/g, "")
  );
}

module.exports = {
  stringToN
};
