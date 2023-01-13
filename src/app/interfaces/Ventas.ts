export interface ClientesI{
    id?: number
    // tipo_cliente:string
//  (
//       ('DETAL','DETAL'),
//       ('AL POR MAYOR','AL POR MAYOR'),
//       ('MANERO','MANERO'),
//  )
    tipocliente :any
    nombres:string
    apellidos:string
    documento :string
    email :string
    telefono :string
    estado :boolean
    sede :any;
    sede_id?:string;
    sede_nombre?:string;
    status?:string;
}

export interface VentasI{
    id?: number
    // tipo_ventas :string
    //   (
    //       ('CREDITO','CREDITO'),
    //       ('EFECTIVO','EFECTIVO'),
    //  )
//     tipo_pagos = (
//         ('TARJETA','TARJETA'),
//         ('EFECTIVO','EFECTIVO'),
//         ('TRANSFERENCIA','TRANSFERENCIA'),
//    )
    cliente_documento?:string
    cliente_apellidos?:string
    valor_deuda?:string
    tipo_pago:any
    usuario? :any
    empleado:any
    numero? :string
    cliente :any
    fecha_venta :string
    estado :boolean
    sede? :any
    subtotal :string
    total:string
    tipoventas:string
    estado_compra?:string
    fecha_creacion?:string

    ventaDetalle?:DetVentasI[]
    estado_venta?:string
    sede_id?:string;
    sede_nombre?:string;
    status?:string;


    caja?:string
    caja_mayor?:string
}

export interface DetVentasI{
    id?: number
    estado :boolean
    cantidad:string 
    descuento:string
    subtotal :string
    producto :any
    producto_nombre?:string;
    valor_unitario :string
    sede :any
    sede_id?:string;
    sede_nombre?:string;
    status?:string;

    cantidad_devolucion?:number
    devolucion?:boolean
    tipo_devolucion?:string
}



    export interface CuotaVentasI{
    id?: number
    // tipo_cuota :string 
//  = (
//       ('CREDITO','CREDITO'),
//       ('EFECTIVO','EFECTIVO'),
//  )
caja_mayor?:any
caja?:any
    estado :boolean
    sede? :any
    valor_cuota :string
    ventas :any
    venta?:any
    cliente? :any
    fecha :string
    tipocuota :any
    sede_id?:string;
    sede_nombre?:string;
    status?:string;
}