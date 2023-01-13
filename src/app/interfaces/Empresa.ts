export interface EmpresaI{
    id?: number
    nombre:string;
     estado: boolean;
     nit: string
     telefono:string
     direccion:string
     correo:string
     numer_sedes:string
     
}


export interface SedesI{
    id?: number
    nombre:string;
    nit :string;
    ciudad:string;
    telefono :string;
    direccion :string;
    correo:string;
    estado :boolean;
    status?:string;
    empresa :any
}
     

export interface PaginacionI{
    count:number;
    next?:any
    previous?:any
    results?:any[]
}