export interface ProductTypes {
    id:          string;
    name:        string;
    description: string;
    price:       number;
    url_image:   string;
    stock:       number;
    total_price?: number;
}
export interface SelectedProductTypes {
  id:           string;
  stock:        number;
  price:        number;
  name:         string;
}