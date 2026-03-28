'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createSystemUser, updateUserAccess } from '@/app/actions/users'
import { Users, Plus, Shield, Check, Edit2, X } from 'lucide-react'

const SYSTEM_MODULES = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'socios', name: 'Gestión de Socios' },
  { id: 'solicitudes', name: 'Solicitudes de Crédito' },
  { id: 'aprobaciones', name: 'Aprobaciones y Comité' },
  { id: 'configuraciones', name: 'Área de Configuraciones' },
  { id: 'usuarios', name: 'Módulo de Usuarios' }
]

export function UsersManagementForm({ users, companyAgencias = [] }: { users: any[], companyAgencias?: any[] }) {
  const [isPending, startTransition] = useTransition()
  
  // State for the modal/form
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
    full_name: '',
    dni: '',
    direccion: '',
    agencia: '',
    telefono: '',
    role: 'ANALISTA',
    modules: ['dashboard'] as string[],
    ver_todos_socios: false
  })

  const resetForm = () => {
    setFormData({ id: '', email: '', password: '', full_name: '', dni: '', direccion: '', agencia: '', telefono: '', role: 'ANALISTA', modules: ['dashboard'], ver_todos_socios: false })
    setIsEditing(false)
    setIsOpen(false)
  }

  const openNewUser = () => {
    resetForm()
    setIsOpen(true)
  }

  const openEditUser = (user: any) => {
    setFormData({
      id: user.id,
      email: 'No se puede editar email',
      password: '',
      full_name: user.full_name || '',
      dni: user.dni || '',
      direccion: user.direccion || '',
      agencia: user.agencia || '',
      telefono: user.telefono || '',
      role: user.role || 'ANALISTA',
      modules: user.modules_access || [],
      ver_todos_socios: !!user.ver_todos_socios
    })
    setIsEditing(true)
    setIsOpen(true)
  }

  const toggleModule = (moduleId: string) => {
    setFormData(prev => {
      const isSelected = prev.modules.includes(moduleId)
      if (isSelected) {
        return { ...prev, modules: prev.modules.filter(m => m !== moduleId) }
      } else {
        return { ...prev, modules: [...prev.modules, moduleId] }
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateUserAccess(formData.id, {
            full_name: formData.full_name,
            role: formData.role,
            modules: formData.modules,
            dni: formData.dni,
            direccion: formData.direccion,
            agencia: formData.agencia,
            telefono: formData.telefono,
            ver_todos_socios: formData.ver_todos_socios
          })
          alert('Acceso y perfil actualizado correctamente.')
        } else {
          if (!formData.email || !formData.password || !formData.full_name) {
            alert('Llene todos los campos para crear el usuario.')
            return
          }
          await createSystemUser(formData)
          alert('Nuevo usuario creado y enrolado correctamente.')
        }
        resetForm()
      } catch (error: any) {
        alert(error.message || 'Ocurrió un error en la base de datos.')
      }
    })
  }

  if (isOpen) {
    return (
      <Card className="max-w-2xl mt-4">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle>{isEditing ? 'Configurar Accesos' : 'Crear Nuevo Usuario'}</CardTitle>
            <CardDescription>{isEditing ? 'Actualizar permisos de módulo' : 'Generar credenciales y asignar rol'}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Rol en el Sistema</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val || 'ANALISTA'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">SUPER ADMIN</SelectItem>
                    <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                    <SelectItem value="ANALISTA">ANALISTA</SelectItem>
                    <SelectItem value="APROBADOR">APROBADOR (Comité)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DNI</Label>
                <Input value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} placeholder="Documento de Identidad" />
              </div>
              <div className="space-y-2">
                <Label>Agencia Asignada</Label>
                <Select value={formData.agencia} onValueChange={(val) => setFormData({...formData, agencia: val || ''})}>
                  <SelectTrigger><SelectValue placeholder="Seleccione Agencia" /></SelectTrigger>
                  <SelectContent>
                    {companyAgencias.map((ag: any, i: number) => (
                      <SelectItem key={i} value={ag.nombre || 'Agencia Central'}>{ag.nombre || 'Agencia Central'}</SelectItem>
                    ))}
                    <SelectItem value="Oficina Principal">Oficina Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teléfono Celular</Label>
                <Input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="999..." />
              </div>
              <div className="space-y-2">
                <Label>Dirección Particular (Opcional)</Label>
                <Input value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} placeholder="Av. / Calle" />
              </div>
            </div>

            {!isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Correo Electrónico (Login)</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña Inicial</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} />
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ver-todos" className="text-sm font-bold text-blue-900 cursor-pointer">Visibilidad Global de Socios</Label>
                  <p className="text-[10px] text-blue-700/70 uppercase font-black">Permitir ver la cartera completa de la institución</p>
                </div>
                <Checkbox 
                  id="ver-todos"
                  checked={formData.ver_todos_socios}
                  onCheckedChange={(checked) => setFormData({...formData, ver_todos_socios: !!checked})}
                  className="h-5 w-5 border-blue-300 data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div>
                <Label className="text-base text-amber-700 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Control de Accesos por Módulo
                </Label>
                <p className="text-sm text-muted-foreground">Seleccione a qué partes del sistema podrá ingresar este usuario.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {SYSTEM_MODULES.map(mod => (
                  <div key={mod.id} className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-slate-50">
                    <Checkbox 
                      id={`mod-${mod.id}`}
                      checked={formData.modules.includes(mod.id)}
                      onCheckedChange={() => toggleModule(mod.id)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor={`mod-${mod.id}`} className="font-medium cursor-pointer">
                        {mod.name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="mr-2">Cancelar</Button>
              <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                <Check className="w-4 h-4 mr-2" />
                {isPending ? 'Guardando...' : (isEditing ? 'Actualizar Accesos' : 'Crear Usuario')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNewUser} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <Card key={user.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{user.full_name}</CardTitle>
                  <CardDescription className="text-xs font-semibold mt-1">
                    ID: {user.id.substring(0, 8)}...
                  </CardDescription>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                  user.role === 'SUPERVISOR' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
              {user.ver_todos_socios && (
                <div className="mt-2 text-right">
                  <span className="text-[9px] font-black uppercase tracking-tighter bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 italic">
                    Base Completa Aut.
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Módulos Asignados</p>
                <div className="flex flex-wrap gap-1">
                  {(user.modules_access || []).length === 0 && <span className="text-xs text-muted-foreground italic">Sin acceso</span>}
                  {(user.modules_access || []).map((mod: string) => (
                    <span key={mod} className="bg-slate-100 border text-slate-700 text-[10px] px-2 py-0.5 rounded capitalize">
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => openEditUser(user)}>
                <Edit2 className="w-3 h-3 mr-2" /> Modificar Perfil / Accesos
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
