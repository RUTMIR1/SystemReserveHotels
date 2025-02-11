import { CategoryDto } from "./Category.js";

export class RoomDto{
    id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    state: string;
    categories: CategoryDto[];
    constructor({id, name, price, description, image_url, state, categories}:{
        id:string, name:string, price:number, description:string, image_url:string,
        state: string, categories:CategoryDto[]}){
            if(!id) throw new Error("missing Room id");
            if(!name) throw new Error("missing Room name");
            if(!price) throw new Error("missing Room price");
            if(!description) throw new Error("missing Room description");
            if(!image_url) throw new Error("missing Room image_url");
            if(!state) throw new Error("missing Room state");
            if(!categories) throw new Error("missing Room Categories");
            this.id = id;
            this.name = name;
            this.price = price;
            this.description = description;
            this.image_url = image_url;
            this.state = state;
            this.categories = categories;
        }
}