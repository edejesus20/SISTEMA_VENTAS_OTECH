export interface CajaI{
    id?: number;
    sede:any;
    fecha_apertura:string;
    usuario_apertura:any;
    estado:boolean;
    fecha_cierre:string;
    saldo_inicial:string;
    saldo_actual:string
    saldo_final_ingresado:string
    fecha_creacion?:string
    fecha_edicion?:string

    total_ventas_efectivo?:string
    total_ventas_tarjeta?:string
    total_ventas_transferencia?:string
    total_ventas_credito?:string
    total_movimientos?:string
    total_gastos?:string
    total_ingresos_efectivo?:string
    total_ingresos_tarjeta?:string
    total_ingresos_transferencia?:string
    saldo_enviado_caja_mayor?:string

    status?:string

    total_salidas_transferencia?:string
    total_salidas_tarjeta?:string
    observaciones?:string
}

// export interface MovimientosI{
//     id?: number;
//     descripcion?:string
//     valor?:string
//     fecha
    
// }
export interface CajaMI{
    id?: number;
    sede:any;
    fecha_apertura:string;
    usuario_apertura:any;
    estado:boolean;
    saldo_inicial:string;
    saldo_actual_efectivo:string
    // saldo_final_ingresado:string
    fecha_creacion?:string
    fecha_edicion?:string
    status?:string

    total_ventas_efectivo?:string
    total_ventas_tarjeta?:string
    total_ventas_transferencia?:string
    total_ventas_credito?:string
    total_movimientos?:string
    total_gastos?:string
    total_ingresos_efectivo?:string
    total_ingresos_tarjeta?:string
    total_ingresos_transferencia?:string

    total_salidas_transferencia?:string
    total_salidas_tarjeta?:string
}


export interface MovimientoCajaI{
    id?: number;

    // tipo_de_movimiento
    //    ('ENTRADA', 'ENTRADA'), ('SALIDA', 'SALIDA'),
    // tipo_de_pago
    // ('TARJETA','TARJETA'),('EFECTIVO','EFECTIVO'),('TRANSFERENCIA','TRANSFERENCIA'),
    // tipo_venta
    // ('CONTADO','CONTADO'),('CREDITO','CREDITO'),('NO APLICA','NO APLICA'),
    sede?:string
    nombre?:string
    factura? :string
    es_venta?:string

    venta_tipo?:string
    usuario?:string
    caja?:string
    fecha_creacion?:string
    fecha_edicion?:string


    // datos requeridos
    descripcion?:string
    factura_externa?:string
    proveedor?:string

    fecha:string
    tipo_movimiento:string
    tipo_pago:string
    valor:string
   
}