export interface TipoproductoI{
    id?: number
    nombre:string;
     descripcion:string;
     estado : boolean;
     sede :string;
     sede_id?:string;
     sede_nombre?:string;
     status?:string;

}


export interface ProductosI{
    id?: number
    nombre :string;
    tipo_producto:any
    precio_venta? :string;
    precio_detal? :string;
    precio_por_mayor? :string;
    estado : boolean;
    codigo_barra? :string;
    sede :any;
    stock_actual?:string;
    cantidad_minima?:string;
    inversion?:string
    // cantidad_maxima?:string;
    // sede_id?:string;
    // sede_nombre?:string;
    status?:string;
    //   tipo_producto
    inventario?:any
    costo?:string
    codigo?:any
}

export interface InventariosI{
    id?: number
    estado : boolean;
    producto :  any;
    stock :string;
    producto_id?:number;
    cantidad_minima :string;
    sede :any;
    sede_id?:string;
    sede_nombre?:string;
    status?:string;
    producto_codigo_barra?:string

   }   
    
// #historialmovimiento
export interface HistorialMovimientosI{
    id?: number
     estado : boolean;
     producto :string;
     cantidad_mov :string;
     usuario :string;
    //  fecha_mov :string;
    sede :any;
    sede_id?:string;
    sede_nombre?:string;
    status?:string;

}