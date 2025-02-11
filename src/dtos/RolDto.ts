export class RolDto{
    id: string;
    name: string;

    constructor({id, name}:{id:string, name:string}){
        if(!id) throw new Error("missing Rol id");
        if(!name) throw new Error("missing Rol name");
        this.id = id;
        this.name = name;
    }
}