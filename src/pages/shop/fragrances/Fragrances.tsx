import CategoryShop from "../CategoryShop";

const FRAGRANCE_CATEGORIES = ["fragrances"] as const;

const Fragrances = () => (
  <CategoryShop
    title="Fragrances"
    blurb="Scents & perfumes"
    categories={FRAGRANCE_CATEGORIES}
    emptyMessage="No fragrances in this catalog."
    skeletonTitleWidth="w-36"
  />
);

export default Fragrances;
