import CategoryShop from "../CategoryShop";

const MEN_CATEGORIES = ["mens-shirts", "mens-shoes", "mens-watches"] as const;

const Men = () => (
  <CategoryShop
    title="Men"
    blurb="Shirts, shoes & watches"
    categories={MEN_CATEGORIES}
    emptyMessage="No men's products in this catalog."
  />
);

export default Men;
