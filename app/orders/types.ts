export interface ProductTypes {
    id:          string;
    name:        string;
    description: string;
    price:       number;
    url_image:   string;
    stock:       number;
}
export interface SelectedProductTypes {
  id: string;
  stock: number;
  price: number;
}