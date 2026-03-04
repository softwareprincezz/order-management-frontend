export const calculateTotals = (products) => {
  return products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
};