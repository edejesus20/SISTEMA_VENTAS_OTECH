export interface UserI {
    id?:number;
    username: string;
    email: string;
    fullName: string;
    password?: string;
    Roles?:[
      {
        name:string
      }
    ]
}

  export interface UserLoginI {
    username: string;
    password: string;
  }
  
  export interface UserLoginResponseI {
    data:  UsernameI;
    token: string;
    message: string
  }
  export interface CambiarPasswordI{
    id?: number;
    oldPassword:string;
    newPassword:string;
}
  
  export interface MenuResponseI {
    id:       number;
    id_padre: number;
    icono:    string;
    link:     string;
    titulo:   string;
  }
  
  export interface UsernameI {
    username: string;
    id: number;
  }

export interface EmpleadosI{
    id?: number
    nombres :string;
    apellidos :string;
    documento :string;
    email :string;
    telefono :string;
    codigo :string;
    estado :boolean;
    sede? :any;
    sede_id?:string;
    sede_nombre?:string;
    status?:string;
}


export interface UsuarioI{
    id?: number
    // """ clase usuario que hereda de la clase abstracta user manager """

    // type_users :string;
    // = (
        
    //     ('ADMINISTRADOR', 'ADMINISTRADOR'),
    //     ('CAJERO', 'CAJERO'),
    // )
    username :string;
    nombres :string;
    apellidos :string;
    documento :string;
    direccion :string;
    email :string;
    type_user:any;
    is_active  :boolean;
    password  :any;
    // status  :boolean;
    sede :any;
    sede_id?:string;
    sede_nombre?:string;
    status?:string;
}