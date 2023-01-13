import { animate, style, transition, trigger } from "@angular/animations";
import { MenuItem } from "primeng/api";

export const fadeInOut=  trigger('fadeInOut',[
  transition(':enter',[
    style({opacity:0}),
    animate('350ms',
    style({opacity:1}))
  ]),
])

export interface MenuItemI{
    label:string;
    routerLink:string;
    icon:string;
    expanded?:boolean;
    items?:MenuItemI[];

}

export let items = ( type_user:string) => {

  if(type_user=='ADMINISTRADOR GENERAL' || type_user=='CEO'){
      let data:MenuItemI[]=  [
        {
          routerLink:'/home',
          icon: 'pi pi-home',
          label:'Escritorio'
        },
        {
          routerLink:'/home/caja',
          icon: 'pi pi-box',
          label:'Caja Menor',
        },

        {
          label: 'Caja Mayor',
          routerLink:'/home/cajaM',
          icon: 'pi pi-inbox', 
    
        },
        {
          label: 'Operaciones',
          routerLink:'/home/operaciones/ventas',
          icon: 'pi pi-desktop',
          items: [
            {
                label: 'Compras',
                routerLink:'/home/operaciones/compras',
                icon: 'pi pi-building', 
            },
            {
              label: 'Abonos de Compras',
              routerLink:'/home/operaciones/cuotacompras',
              icon: 'pi pi-building', 
            },
            {
                label: 'Ventas',
                routerLink:'/home/operaciones/ventas',
                icon: 'pi pi-building', 
            },
            {
              label: 'Abonos de Ventas',
              routerLink:'/home/operaciones/cuotaventas',
              icon: 'pi pi-building', 
            },
            // {
            //   label: 'Devoluciones de Ventas',
            //   routerLink:'/home/operaciones/devolucionesventas',
            //   icon: 'pi pi-users', 
            // },
          ]
          
        },
        {
          label: 'Inventarios',
          routerLink:'/home/inventarios',
          icon: 'pi pi-database',
          items:[
            {
              label: 'Productos',
              routerLink:'/home/inventarios/productos',
              icon: 'pi pi-chevron-down ml-auto',
            },
            {
                label: 'Tipo Productos',
                routerLink:'/home/inventarios/tipoproductos',
                icon: 'pi pi-chevron-down ml-auto',
              },
          ]
        },
        
        {
          label: 'Clientes',
          routerLink:'/home/clientes',
          icon: 'pi pi-id-card',
          
        },
        {
          label: 'Empleados',
          routerLink:'/home/empleados',
          icon: 'pi pi-star',
        },
        {
          label: 'Proveedores',
          routerLink:'/home/proveedores',
          icon: 'pi pi-bolt',
         
          
        },
        {
          label: 'Administracion',
          routerLink:'/home/administracion/sedes',
          icon: 'pi pi-building',
          items: [
            {
                label: 'Sedes',
                routerLink:'/home/administracion/sedes',
                icon: 'pi pi-building', 
            },
            {
              label: 'Moverse de Sede',
              routerLink:'/home/administracion/moverse',
              icon: 'pi pi-building', 
          },
            {
              label: 'Usuarios',
              routerLink:'/home/administracion/usuarios',
              icon: 'pi pi-users', 
          }
          ]
         
          
        },
      ];
      return  data
  }else{
    if(type_user=='CAJERO'){
      let data:MenuItemI[]=[
        {
          routerLink:'/home/caja',
          icon: 'pi pi-box',
          label:'Caja Menor',
        },

        // {
        //   label: 'Caja Mayor',
        //   routerLink:'/home/cajaM',
        //   icon: 'pi pi-inbox', 
    
        // },
        {
          label: 'Operaciones',
          routerLink:'/home/operaciones/ventas',
          icon: 'pi pi-desktop',
          items: [
          //   {
          //     label: 'Compras',
          //     routerLink:'/home/operaciones/compras',
          //     icon: 'pi pi-building', 
          // },
          // {
          //   label: 'Abonos de Compras',
          //   routerLink:'/home/operaciones/cuotacompras',
          //   icon: 'pi pi-building', 
          // },
          {
              label: 'Ventas',
              routerLink:'/home/operaciones/ventas',
              icon: 'pi pi-building', 
          },
          {
            label: 'Abonos de Ventas',
            routerLink:'/home/operaciones/cuotaventas',
            icon: 'pi pi-building', 
          }
          ]
          
        },
        {
          label: 'Inventarios',
          routerLink:'/home/inventarios',
          icon: 'pi pi-database',
          items:[
            {
              label: 'Productos',
              routerLink:'/home/inventarios/productos',
              icon: 'pi pi-chevron-down ml-auto',
            },
            {
                label: 'Tipo Productos',
                routerLink:'/home/inventarios/tipoproductos',
                icon: 'pi pi-chevron-down ml-auto',
              },
          ]
        },
    
        {
          label: 'Clientes',
          routerLink:'/home/clientes',
          icon: 'pi pi-id-card',
          
        },
        {
          label: 'Empleados',
          routerLink:'/home/empleados',
          icon: 'pi pi-star',
        },
        // {
        //   label: 'Proveedores',
        //   routerLink:'/home/proveedores',
        //   icon: 'pi pi-bolt',
        // },
      ];
      return data
    }else{

      if(type_user=='ADMINISTRADOR'){
        let data:MenuItemI[]=  [
          // {
          //   routerLink:'/home',
          //   icon: 'pi pi-home',
          //   label:'Escritorio'
          // },
          {
            routerLink:'/home/caja',
            icon: 'pi pi-box',
            label:'Caja Menor',
          },
  
          // {
          //   label: 'Caja Mayor',
          //   routerLink:'/home/cajaM',
          //   icon: 'pi pi-inbox', 
      
          // },
          {
            label: 'Operaciones',
            routerLink:'/home/operaciones/ventas',
            icon: 'pi pi-desktop',
            items: [
              // {
              //     label: 'Compras',
              //     routerLink:'/home/operaciones/compras',
              //     icon: 'pi pi-building', 
              // },
              // {
              //   label: 'Abonos de Compras',
              //   routerLink:'/home/operaciones/cuotacompras',
              //   icon: 'pi pi-building', 
              // },
              {
                  label: 'Ventas',
                  routerLink:'/home/operaciones/ventas',
                  icon: 'pi pi-building', 
              },
              {
                label: 'Abonos de Ventas',
                routerLink:'/home/operaciones/cuotaventas',
                icon: 'pi pi-building', 
              },
              // {
              //   label: 'Devoluciones de Ventas',
              //   routerLink:'/home/operaciones/devolucionesventas',
              //   icon: 'pi pi-users', 
              // },
            ]
            
          },
          {
            label: 'Inventarios',
            routerLink:'/home/inventarios',
            icon: 'pi pi-database',
            items:[
              {
                label: 'Productos',
                routerLink:'/home/inventarios/productos',
                icon: 'pi pi-chevron-down ml-auto',
              },
              {
                  label: 'Tipo Productos',
                  routerLink:'/home/inventarios/tipoproductos',
                  icon: 'pi pi-chevron-down ml-auto',
                },
            ]
          },
          
          {
            label: 'Clientes',
            routerLink:'/home/clientes',
            icon: 'pi pi-id-card',
            
          },
          {
            label: 'Empleados',
            routerLink:'/home/empleados',
            icon: 'pi pi-star',
          },
          {
            label: 'Proveedores',
            routerLink:'/home/proveedores',
            icon: 'pi pi-bolt',
           
            
          },
          {
            label: 'Administracion',
            routerLink:'/home/administracion/sedes',
            icon: 'pi pi-building',
            items: [
              {
                  label: 'Sedes',
                  routerLink:'/home/administracion/sedes',
                  icon: 'pi pi-building', 
              },
              {
                label: 'Moverse de Sede',
                routerLink:'/home/administracion/moverse',
                icon: 'pi pi-building', 
            },
            //   {
            //     label: 'Usuarios',
            //     routerLink:'/home/administracion/usuarios',
            //     icon: 'pi pi-users', 
            // }
            ]
           
            
          },
        ];
        return  data
      }else{
        return null

      }
    }
  } 
}

// export let  itemsM:MenuItemI[] = [

//     {
//       routerLink:'/home',
//       icon: 'pi pi-home',
//       label:'Escritorio'
//     },
//     {
//       label: 'Inventarios',
//       routerLink:'/home/inventarios',
//       icon: 'pi pi-database',
//       items:[
//         {
//           label: 'Productos',
//           routerLink:'/home/inventarios/productos',
//           icon: 'pi pi-chevron-down ml-auto',
//         },
//         {
//             label: 'Tipo Productos',
//             routerLink:'/home/inventarios/tipoproductos',
//             icon: 'pi pi-chevron-down ml-auto',
//           },
//       ]
//     },
//     {
//       label: 'Operaciones',
//       routerLink:'/home/operaciones',
//       icon: 'pi pi-desktop',
//       items: [
//         {
//             label: 'Compras',
//             routerLink:'/home/operaciones/compras',
//             icon: 'pi pi-building', 
//         },
//         {
//             label: 'Ventas',
//             routerLink:'/home/operaciones/ventas',
//             icon: 'pi pi-building', 
//         }
//       ]
      
//     },
//     {
//       label: 'Clientes',
//       routerLink:'/home/clientes',
//       icon: 'pi pi-id-card',
      
//     },
//     {
//       label: 'Empleados',
//       routerLink:'/home/empleados',
//       icon: 'pi pi-star',
//     },
//     {
//       label: 'Proveedores',
//       routerLink:'/home/proveedores',
//       icon: 'pi pi-bolt',
     
      
//     },
//     {
//       label: 'Administracion',
//       routerLink:'/home/administracion',
//       icon: 'pi pi-building',
//       items: [
//         {
//             label: 'Sedes',
//             routerLink:'/home/administracion/sedes',
//             icon: 'pi pi-building', 
//         },
//         {
//           label: 'Moverse de Sede',
//           routerLink:'/home/administracion/moverse',
//           icon: 'pi pi-building', 
//       },
//         {
//           label: 'Usuarios',
//           routerLink:'/home/administracion/usuarios',
//           icon: 'pi pi-users', 
//       }
//       ]
     
      
//     },
// ];