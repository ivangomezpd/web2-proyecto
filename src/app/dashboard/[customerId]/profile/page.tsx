"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCustomer, saveCustomer } from "@/lib/db/db";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building, MapPin, Phone, Calendar, Edit, Save, X } from "lucide-react";

interface Customer {
  CustomerID: string;
  CompanyName: string;
  ContactName: string;
  ContactTitle: string;
  Address: string;
  City: string;
  Region: string | null;
  PostalCode: string;
  Country: string;
  Phone: string;
  Fax: string | null;
}

export default function CustomerProfile() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const customerData = await getCustomer(customerId as string);
        setCustomer(customerData);
        setEditedCustomer(customerData);
      } catch (err) {
        setError("Failed to fetch customer data");
        console.error(err);
      }
    }

    fetchCustomer();
  }, [customerId]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedCustomer(customer);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCustomer(customer);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    if (!editedCustomer) return;

    try {
      setIsSaving(true);
      await saveCustomer(customerId as string, editedCustomer);
      setCustomer(editedCustomer);
      setIsEditing(false);
      setSuccessMessage("Perfil actualizado correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Error al actualizar el perfil");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    if (!editedCustomer) return;
    setEditedCustomer({
      ...editedCustomer,
      [field]: value
    });
  };

  // Extraer nombre y apellido del ContactName
  const getFullName = (contactName: string) => {
    const parts = contactName.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  };

  const { firstName, lastName } = customer ? getFullName(customer.ContactName) : { firstName: '', lastName: '' };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert>
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos Básicos de la Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Datos Básicos de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID de Cliente</label>
                <p className="font-semibold text-gray-900">{customer.CustomerID}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                {isEditing ? (
                  <Input
                    value={firstName}
                    onChange={(e) => {
                      const newContactName = e.target.value + ' ' + lastName;
                      handleInputChange('ContactName', newContactName);
                    }}
                    placeholder="Nombre"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">{firstName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Apellidos</label>
                {isEditing ? (
                  <Input
                    value={lastName}
                    onChange={(e) => {
                      const newContactName = firstName + ' ' + e.target.value;
                      handleInputChange('ContactName', newContactName);
                    }}
                    placeholder="Apellidos"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">{lastName}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre de la Empresa</label>
              {isEditing ? (
                <Input
                  value={editedCustomer?.CompanyName || ''}
                  onChange={(e) => handleInputChange('CompanyName', e.target.value)}
                  placeholder="Nombre de la empresa"
                />
              ) : (
                <p className="font-semibold text-gray-900">{customer.CompanyName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Cargo</label>
              {isEditing ? (
                <Input
                  value={editedCustomer?.ContactTitle || ''}
                  onChange={(e) => handleInputChange('ContactTitle', e.target.value)}
                  placeholder="Cargo en la empresa"
                />
              ) : (
                <p className="font-semibold text-gray-900">{customer.ContactTitle}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Teléfono</label>
              {isEditing ? (
                <Input
                  value={editedCustomer?.Phone || ''}
                  onChange={(e) => handleInputChange('Phone', e.target.value)}
                  placeholder="Teléfono"
                />
              ) : (
                <p className="font-semibold text-gray-900">{customer.Phone}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fax</label>
              {isEditing ? (
                <Input
                  value={editedCustomer?.Fax || ''}
                  onChange={(e) => handleInputChange('Fax', e.target.value)}
                  placeholder="Fax (opcional)"
                />
              ) : (
                <p className="font-semibold text-gray-900">{customer.Fax || 'No especificado'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Dirección</label>
              {isEditing ? (
                <Input
                  value={editedCustomer?.Address || ''}
                  onChange={(e) => handleInputChange('Address', e.target.value)}
                  placeholder="Dirección"
                />
              ) : (
                <p className="font-semibold text-gray-900">{customer.Address}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Ciudad</label>
                {isEditing ? (
                  <Input
                    value={editedCustomer?.City || ''}
                    onChange={(e) => handleInputChange('City', e.target.value)}
                    placeholder="Ciudad"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">{customer.City}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Código Postal</label>
                {isEditing ? (
                  <Input
                    value={editedCustomer?.PostalCode || ''}
                    onChange={(e) => handleInputChange('PostalCode', e.target.value)}
                    placeholder="Código Postal"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">{customer.PostalCode}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Región</label>
                {isEditing ? (
                  <Input
                    value={editedCustomer?.Region || ''}
                    onChange={(e) => handleInputChange('Region', e.target.value)}
                    placeholder="Región (opcional)"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">{customer.Region || 'No especificado'}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">País</label>
                {isEditing ? (
                  <Input
                    value={editedCustomer?.Country || ''}
                    onChange={(e) => handleInputChange('Country', e.target.value)}
                    placeholder="País"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">{customer.Country}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
