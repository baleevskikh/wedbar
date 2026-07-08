import type { StaticImageData } from "next/image";

import blueDrink from "../../images/blue.png";
import orangeDrink from "../../images/orange.png";
import redDrink from "../../images/red.png";
import yellowDrink from "../../images/yellow.png";

export type Drink = {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  image: StaticImageData;
};

export const drinks: Drink[] = [
  {
    id: "red",
    name: "Ruby Sour",
    description: "Ягодная кислинка, сухой финиш и плотная пена.",
    ingredients: "Gin, raspberry, lemon, aquafaba",
    image: redDrink,
  },
  {
    id: "orange",
    name: "Aperol Highball",
    description: "Легкий аперитив с апельсином, содовой и горькой нотой.",
    ingredients: "Aperol, orange, prosecco, soda",
    image: orangeDrink,
  },
  {
    id: "blue",
    name: "Midnight Fizz",
    description: "Холодный цитрус, минералы и мягкая сладость на льду.",
    ingredients: "Vodka, blue curacao, lime, tonic",
    image: blueDrink,
  },
  {
    id: "yellow",
    name: "Golden Collins",
    description: "Солнечный long drink с лимоном, медом и сухой содовой.",
    ingredients: "Gin, lemon, honey, soda",
    image: yellowDrink,
  },
];

