export class CategoryDto{
    id: string;
    name: string;

    constructor({id, name}:{id:string, name:string}){
        if(!id) throw new Error("missing Category id");
        if(!name) throw new Error("missing Category name");
        this.id = id;
        this.name = name;
    }
} 