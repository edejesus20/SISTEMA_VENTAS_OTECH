import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guard/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { ProductosComponent } from '../../pages/inventarios/productos/productos.component';
import { PrivateComponent } from './private.component';
import { InicioInventariosComponent } from 'src/app/pages/inventarios/inicio-inventarios/inicio-inventarios.component';
import { TipoProductoComponent } from 'src/app/pages/inventarios/tipo-producto/tipo-producto.component';
import { ComprasComponent } from 'src/app/pages/operaciones/compras/compras.component';
import { VentasComponent } from 'src/app/pages/operaciones/ventas/ventas.component';
import { InicioOperacionesComponent } from 'src/app/pages/operaciones/inicio-operaciones/inicio-operaciones.component';
import { InicioAdministracionComponent } from 'src/app/pages/administracion/inicio-administracion/inicio-administracion.component';
import { SedesComponent } from 'src/app/pages/administracion/sedes/sedes.component';
import { UsuariosComponent } from 'src/app/pages/administracion/usuarios/usuarios.component';
import { ClientesComponent } from 'src/app/pages/clientes/clientes.component';
import { ProveedoresComponent } from 'src/app/pages/proveedores/proveedores.component';
import { EmpleadosComponent } from 'src/app/pages/empleados/empleados.component';
import { MoverSedeComponent } from './components/moverSede/moverSede.component';
import { CajaComponent } from 'src/app/pages/caja/caja.component';
import { CuotaVentasComponent } from 'src/app/pages/operaciones/cuota-ventas/cuota-ventas.component';
import { CuotaComprasComponent } from 'src/app/pages/operaciones/cuota-compras/cuota-compras.component';
import { CajaMayorComponent } from 'src/app/pages/caja-mayor/caja-mayor.component';

const routes: Routes = [
  {
    path: 'home',
    component: PrivateComponent,
    canActivate: [AuthGuard],
    canLoad:[AuthGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'caja',
        component: CajaComponent,
      },
      {
        path: 'cajaM',
        component: CajaMayorComponent,
      },

      
      
      {
        path: 'inventarios',
        component: InicioInventariosComponent,
      },
      {
        path: 'inventarios/productos',
        component: ProductosComponent,
      },
      {
        path: 'inventarios/tipoproductos',
        component: TipoProductoComponent,
      },
  //   ]
      // },
      {
        path: 'operaciones',
        component: InicioOperacionesComponent,
      },
      {
        path: 'operaciones/compras',
        component: ComprasComponent,
      },
      {
        path: 'operaciones/ventas',
        component: VentasComponent,
      },

      
      {
        path: 'operaciones/cuotacompras',
        component: CuotaComprasComponent,
      },
      {
        path: 'operaciones/cuotaventas',
        component: CuotaVentasComponent,
      },
      

      {
        path: 'administracion',
        component: InicioAdministracionComponent,
      },
      {
        path: 'administracion/sedes',
        component: SedesComponent,
      },
      {
        path: 'administracion/moverse',
        component: MoverSedeComponent,
      },
      
      {
        path: 'administracion/usuarios',
        component: UsuariosComponent,
      },

      {
        path: 'clientes',
        component: ClientesComponent,
      },
      {
        path: 'proveedores',
        component: ProveedoresComponent,
      },
      {
        path: 'empleados',
        component: EmpleadosComponent,
      },
       {
    path: '**',
    redirectTo:'/home',
  }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class PrivateRoutingModule { }
