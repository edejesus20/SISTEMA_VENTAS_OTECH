export interface  ProveedoresI{
    id?: number
    estado :boolean
     nombre:string
     nit :string
     direccion:string
     telefono:string;
     status?:string;
}

   //  tipo_compra:string
    // //  = [
    // //       'CREDITO','CREDITO',
    // //       'EFECTIVO','EFECTIVO',
    // //  ]
export interface  ComprasI{
    id?: number
// obligatorios
plazo_descuento?:string
factura?:any
    estado_compra?:string
    numero:string
    fecha_compra :string
    estado :boolean | any
    subtotal :string
    total:string
    valor_deuda?:string
    tipocompra :string
    usuario :any
    proveedor:any
    sede :any
    sede_id?:string;
    sede_nombre?:string;
    status?:string;
    fecha_creacion?:string
    compraDetalle?:DetCompraI[] | any
    // proveedor?:ProveedoresI
     }

export interface  DetCompraI{
    id?: number
    estado :boolean
     cantidad :string
     precio_compra :string;
     descuento :string;
     subtotal :string;
     producto :any
    //  compra :number
     sede :any
     sede_id?:string;
     sede_nombre?:string;
     status?:string;
     producto_nombre?:string;
 }


         //  tipo_cuota:string
    // //  = [
    // //       'CREDITO','CREDITO',
    // //       'EFECTIVO','EFECTIVO'
    // //  ]
export interface  CuotaComprasI{
    id?: number
// obligatorio

     estado :boolean
     valor_cuota :string;
     fecha:string
     tipocuota :any
     sede? :any
     compras :any
     compra?:string;
     proveedor? :any;
     sede_id?:string;
     sede_nombre?:string;
     status?:string;
}