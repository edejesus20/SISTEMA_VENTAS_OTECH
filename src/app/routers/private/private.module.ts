import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './components/home/home.component';
import { MenuComponent } from './components/menu/menu.component';
import { PrivateRoutingModule } from './private-routing.module';
import { PrivateComponent } from './private.component';
import {DataViewModule} from 'primeng/dataview';
import {PasswordModule} from 'primeng/password';
import {AccordionModule} from 'primeng/accordion';
import {MultiSelectModule} from 'primeng/multiselect';
import {StyleClassModule} from 'primeng/styleclass';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {TabMenuModule} from 'primeng/tabmenu';
import {TabViewModule} from 'primeng/tabview';
import {ScrollTopModule} from 'primeng/scrolltop';
import {StepsModule} from 'primeng/steps';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { SplitterModule } from 'primeng/splitter';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ChartModule } from 'primeng/chart';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { TableModule } from 'primeng/table';
import { KeyFilterModule } from 'primeng/keyfilter';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {BadgeModule} from 'primeng/badge';

import { PanelModule } from 'primeng/panel';
import { InputNumberModule } from 'primeng/inputnumber';
import { CarouselModule } from 'primeng/carousel';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { OverlayModule } from '@angular/cdk/overlay'
import { CdkMenuModule } from '@angular/cdk/menu'
import { BodyComponent } from './components/Body/Body.component';
import { MenuHorizontalComponent } from './components/menu-horizontal/menu-horizontal.component';
import { ProductosComponent } from '../../pages/inventarios/productos/productos.component';
import { SubnivelMenuComponent } from './components/menu/subnivel-menu.component';
import { InicioAdministracionComponent } from 'src/app/pages/administracion/inicio-administracion/inicio-administracion.component';
import { SedesComponent } from 'src/app/pages/administracion/sedes/sedes.component';
import { InicioInventariosComponent } from 'src/app/pages/inventarios/inicio-inventarios/inicio-inventarios.component';
import { UsuariosComponent } from 'src/app/pages/administracion/usuarios/usuarios.component';
import { ComprasComponent } from 'src/app/pages/operaciones/compras/compras.component';
import { TipoProductoComponent } from 'src/app/pages/inventarios/tipo-producto/tipo-producto.component';
import { InicioOperacionesComponent } from 'src/app/pages/operaciones/inicio-operaciones/inicio-operaciones.component';
import { VentasComponent } from 'src/app/pages/operaciones/ventas/ventas.component';
import { EmpleadosComponent } from 'src/app/pages/empleados/empleados.component';
import { ProveedoresComponent } from 'src/app/pages/proveedores/proveedores.component';
import { ClientesComponent } from 'src/app/pages/clientes/clientes.component';
import {SliderModule} from 'primeng/slider';
import { NgxBarcode6Module } from 'ngx-barcode6';
import {SpeedDialModule} from 'primeng/speeddial';
import { MoverSedeComponent } from './components/moverSede/moverSede.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CajaComponent } from 'src/app/pages/caja/caja.component';
import { CuotaComprasComponent } from 'src/app/pages/operaciones/cuota-compras/cuota-compras.component';
import { CuotaVentasComponent } from 'src/app/pages/operaciones/cuota-ventas/cuota-ventas.component';
import { CajaMayorComponent } from 'src/app/pages/caja-mayor/caja-mayor.component';
import {ImageModule} from 'primeng/image';
import {PaginatorModule} from 'primeng/paginator';

@NgModule({
  declarations: [
    PrivateComponent,
    CajaMayorComponent,
    MenuComponent,
    MoverSedeComponent,
    HomeComponent,
    BodyComponent,
    MenuHorizontalComponent,
    ProductosComponent,
    SubnivelMenuComponent,
    InicioAdministracionComponent,
    SedesComponent,
    UsuariosComponent,
    InicioInventariosComponent,
    TipoProductoComponent,
    ComprasComponent,
    InicioOperacionesComponent,
    VentasComponent,
    EmpleadosComponent,ProveedoresComponent,ClientesComponent,
    CajaComponent,
    CuotaComprasComponent,CuotaVentasComponent
  ],
  imports: [SpeedDialModule,
    PaginatorModule,
    PasswordModule,
    SliderModule,ImageModule,
    CommonModule,
    NgxBarcode6Module,
    BrowserModule,
    PrivateRoutingModule,
    OverlayModule,
    CdkMenuModule,
    ReactiveFormsModule,
    DataViewModule,
    AccordionModule,
    HttpClientModule,
    FormsModule,
    StepsModule,
    TabMenuModule,
    TabViewModule,
    ScrollTopModule,
    BrowserAnimationsModule,
    MultiSelectModule,
    StyleClassModule,
    DividerModule,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    RippleModule,
    InputTextModule,
    OverlayPanelModule,
    CardModule,
    MenuModule,
    MessagesModule,
    MessageModule,

    SplitterModule,
    AvatarGroupModule,
    AvatarModule,
    SidebarModule,
    PanelMenuModule,
    ChartModule,
    ToolbarModule,
    SplitButtonModule,
    DialogModule,
    ConfirmPopupModule,
    ToastModule,
    TreeModule,
    // SharedModule,
    // VirtualScrollerModule,
    TableModule,
    KeyFilterModule,
    DropdownModule,
    CalendarModule,

    PanelModule,
    AutoCompleteModule,
    InputNumberModule,
    CarouselModule,

    MenuModule,

    FieldsetModule,
    FileUploadModule,
    InputTextareaModule,
    ConfirmDialogModule,
    BadgeModule
  ],
  providers: [DynamicDialogRef,DynamicDialogConfig],
  bootstrap: [PrivateComponent]
})
export class PrivateModule { }
