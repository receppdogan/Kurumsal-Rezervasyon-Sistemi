import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Trash2, Settings } from 'lucide-react';

export default function BookingRulesManager({ 
  bookingRules, 
  setBookingRules, 
  departments, 
  employees 
}) {
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(0);
  
  const currentRule = bookingRules.rules[selectedRuleIndex];

  const updateRule = (field, value) => {
    const updatedRules = [...bookingRules.rules];
    updatedRules[selectedRuleIndex] = {
      ...updatedRules[selectedRuleIndex],
      [field]: value
    };
    setBookingRules({ rules: updatedRules });
  };

  const addNewRule = () => {
    const newRule = {
      id: Date.now().toString(),
      name: `Kural ${bookingRules.rules.length + 1}`,
      applies_to: 'all',
      department_list: [],
      employee_list: [],
      hotel_max_stars: 5,
      hotel_max_price_per_night: null,
      requires_manager_approval: true,
      economy_booking_days_before: 0,
      business_booking_days_before: null,
      priority: 100
    };
    setBookingRules({ rules: [...bookingRules.rules, newRule] });
    setSelectedRuleIndex(bookingRules.rules.length);
  };

  const deleteRule = (index) => {
    if (bookingRules.rules.length === 1) {
      alert('En az bir kural olmalıdır');
      return;
    }
    const updatedRules = bookingRules.rules.filter((_, i) => i !== index);
    setBookingRules({ rules: updatedRules });
    setSelectedRuleIndex(Math.max(0, index - 1));
  };

  const toggleDepartment = (dept) => {
    const current = currentRule.department_list || [];
    const updated = current.includes(dept)
      ? current.filter(d => d !== dept)
      : [...current, dept];
    updateRule('department_list', updated);
  };

  const toggleEmployee = (empId) => {
    const current = currentRule.employee_list || [];
    const updated = current.includes(empId)
      ? current.filter(e => e !== empId)
      : [...current, empId];
    updateRule('employee_list', updated);
  };

  return (
    <div className="space-y-6">
      {/* Rule List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Rezervasyon Kuralları</CardTitle>
              <CardDescription>
                Farklı departman veya çalışanlar için özel kurallar tanımlayın
              </CardDescription>
            </div>
            <Button onClick={addNewRule} size="sm" data-testid="add-rule-button">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kural
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {bookingRules.rules.map((rule, index) => (
              <div
                key={rule.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRuleIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRuleIndex(index)}
                data-testid={`rule-card-${index}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{rule.name}</h4>
                  {bookingRules.rules.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRule(index);
                      }}
                      className="text-red-600 hover:text-red-800"
                      data-testid={`delete-rule-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      rule.applies_to === 'all' ? 'bg-blue-100 text-blue-800' :
                      rule.applies_to === 'departments' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {rule.applies_to === 'all' ? 'Tüm Çalışanlar' :
                       rule.applies_to === 'departments' ? 'Departmanlar' : 'Çalışanlar'}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Öncelik: {rule.priority}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rule Details */}
      {currentRule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Kural Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">Kural Adı</Label>
                <Input
                  id="rule_name"
                  value={currentRule.name}
                  onChange={(e) => updateRule('name', e.target.value)}
                  placeholder="Örn: Yönetici Kuralı"
                  data-testid="rule-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule_priority">Öncelik</Label>
                <Input
                  id="rule_priority"
                  type="number"
                  min="1"
                  value={currentRule.priority}
                  onChange={(e) => updateRule('priority', parseInt(e.target.value))}
                  data-testid="rule-priority-input"
                />
                <p className="text-xs text-gray-500">Düşük numara = Yüksek öncelik</p>
              </div>
            </div>

            {/* Applies To */}
            <div className="space-y-3">
              <Label>Kural Kimlere Uygulanacak?</Label>
              <Select
                value={currentRule.applies_to}
                onValueChange={(value) => updateRule('applies_to', value)}
              >
                <SelectTrigger data-testid="applies-to-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Çalışanlar</SelectItem>
                  <SelectItem value="departments">Belirli Departmanlar</SelectItem>
                  <SelectItem value="employees">Belirli Çalışanlar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Selection */}
            {currentRule.applies_to === 'departments' && (
              <div className="space-y-3">
                <Label>Departmanlar Seçin</Label>
                <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`dept-${dept}`}
                          checked={currentRule.department_list?.includes(dept)}
                          onChange={() => toggleDepartment(dept)}
                          className="h-4 w-4"
                          data-testid={`dept-checkbox-${dept}`}
                        />
                        <label htmlFor={`dept-${dept}`} className="text-sm">
                          {dept}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Henüz departman bulunmuyor</p>
                  )}
                </div>
              </div>
            )}

            {/* Employee Selection */}
            {currentRule.applies_to === 'employees' && (
              <div className="space-y-3">
                <Label>Çalışanlar Seçin</Label>
                <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <div key={emp.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`emp-${emp.id}`}
                          checked={currentRule.employee_list?.includes(emp.id)}
                          onChange={() => toggleEmployee(emp.id)}
                          className="h-4 w-4"
                          data-testid={`emp-checkbox-${emp.id}`}
                        />
                        <label htmlFor={`emp-${emp.id}`} className="text-sm">
                          {emp.full_name} ({emp.email})
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Henüz çalışan bulunmuyor</p>
                  )}
                </div>
              </div>
            )}

            {/* Service Based Limits */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold text-lg">Servis Bazlı Limitler</h4>
              <p className="text-sm text-gray-600">Her servis için ayrı kurallar belirleyin. Devre dışı bırakılan servisler için kural uygulanmaz.</p>
              
              {/* Hotel Limits */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hotel_enabled"
                      checked={currentRule.hotel_limits?.enabled ?? true}
                      onChange={(e) => updateRule('hotel_limits', { 
                        ...(currentRule.hotel_limits || {}), 
                        enabled: e.target.checked 
                      })}
                      className="h-4 w-4"
                      data-testid="hotel-enabled-checkbox"
                    />
                    <Label htmlFor="hotel_enabled" className="font-semibold text-base">
                      🏨 Otel Rezervasyonları
                    </Label>
                  </div>
                </div>
                
                {currentRule.hotel_limits?.enabled && (
                  <div className="pl-6 space-y-3 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="hotel_stars">Maksimum Yıldız</Label>
                        <Input
                          id="hotel_stars"
                          type="number"
                          min="1"
                          max="5"
                          value={currentRule.hotel_limits?.max_stars ?? 5}
                          onChange={(e) => updateRule('hotel_limits', { 
                            ...(currentRule.hotel_limits || {}), 
                            max_stars: parseInt(e.target.value) 
                          })}
                          data-testid="hotel-stars-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hotel_price_per_night">Maksimum Gecelik Fiyat (TL)</Label>
                        <Input
                          id="hotel_price_per_night"
                          type="number"
                          min="0"
                          value={currentRule.hotel_limits?.max_price_per_night || ''}
                          onChange={(e) => updateRule('hotel_limits', { 
                            ...(currentRule.hotel_limits || {}), 
                            max_price_per_night: parseFloat(e.target.value) || null 
                          })}
                          placeholder="Limitsiz"
                          data-testid="hotel-price-input"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hotel_approval"
                        checked={currentRule.hotel_limits?.requires_approval ?? true}
                        onChange={(e) => updateRule('hotel_limits', { 
                          ...(currentRule.hotel_limits || {}), 
                          requires_approval: e.target.checked 
                        })}
                        className="h-4 w-4"
                        data-testid="hotel-approval-checkbox"
                      />
                      <Label htmlFor="hotel_approval" className="font-normal text-sm">
                        Manager onayı gerekli
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Flight Limits */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="flight_enabled"
                      checked={currentRule.flight_limits?.enabled ?? false}
                      onChange={(e) => updateRule('flight_limits', { 
                        ...(currentRule.flight_limits || {}), 
                        enabled: e.target.checked 
                      })}
                      className="h-4 w-4"
                      data-testid="flight-enabled-checkbox"
                    />
                    <Label htmlFor="flight_enabled" className="font-semibold text-base">
                      ✈️ Uçuş Rezervasyonları
                    </Label>
                  </div>
                </div>
                
                {currentRule.flight_limits?.enabled && (
                  <div className="pl-6 space-y-3 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="flight_max_price">Maksimum Bilet Fiyatı (TL)</Label>
                        <Input
                          id="flight_max_price"
                          type="number"
                          min="0"
                          value={currentRule.flight_limits?.max_price || ''}
                          onChange={(e) => updateRule('flight_limits', { 
                            ...(currentRule.flight_limits || {}), 
                            max_price: parseFloat(e.target.value) || null 
                          })}
                          placeholder="Limitsiz"
                          data-testid="flight-price-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flight_class">Sınıf Kısıtlaması</Label>
                        <Select
                          value={currentRule.flight_limits?.flight_class_restriction || 'none'}
                          onValueChange={(value) => updateRule('flight_limits', { 
                            ...(currentRule.flight_limits || {}), 
                            flight_class_restriction: value === 'none' ? null : value 
                          })}
                        >
                          <SelectTrigger data-testid="flight-class-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Kısıtlama Yok</SelectItem>
                            <SelectItem value="economy">Sadece Economy</SelectItem>
                            <SelectItem value="business">Economy veya Business</SelectItem>
                            <SelectItem value="first">Tüm Sınıflar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flight_days_before">Minimum Kaç Gün Önceden (Gün)</Label>
                        <Input
                          id="flight_days_before"
                          type="number"
                          min="0"
                          value={currentRule.flight_limits?.min_days_before || ''}
                          onChange={(e) => updateRule('flight_limits', { 
                            ...(currentRule.flight_limits || {}), 
                            min_days_before: parseInt(e.target.value) || null 
                          })}
                          placeholder="Kısıtlama yok"
                          data-testid="flight-days-input"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="flight_approval"
                        checked={currentRule.flight_limits?.requires_approval ?? true}
                        onChange={(e) => updateRule('flight_limits', { 
                          ...(currentRule.flight_limits || {}), 
                          requires_approval: e.target.checked 
                        })}
                        className="h-4 w-4"
                        data-testid="flight-approval-checkbox"
                      />
                      <Label htmlFor="flight_approval" className="font-normal text-sm">
                        Manager onayı gerekli
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Transfer Limits */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="transfer_enabled"
                      checked={currentRule.transfer_limits?.enabled ?? false}
                      onChange={(e) => updateRule('transfer_limits', { 
                        ...(currentRule.transfer_limits || {}), 
                        enabled: e.target.checked 
                      })}
                      className="h-4 w-4"
                      data-testid="transfer-enabled-checkbox"
                    />
                    <Label htmlFor="transfer_enabled" className="font-semibold text-base">
                      🚗 Transfer Hizmetleri
                    </Label>
                  </div>
                </div>
                
                {currentRule.transfer_limits?.enabled && (
                  <div className="pl-6 space-y-3 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="transfer_max_price">Maksimum Fiyat (TL)</Label>
                        <Input
                          id="transfer_max_price"
                          type="number"
                          min="0"
                          value={currentRule.transfer_limits?.max_price || ''}
                          onChange={(e) => updateRule('transfer_limits', { 
                            ...(currentRule.transfer_limits || {}), 
                            max_price: parseFloat(e.target.value) || null 
                          })}
                          placeholder="Limitsiz"
                          data-testid="transfer-price-input"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="transfer_approval"
                        checked={currentRule.transfer_limits?.requires_approval ?? true}
                        onChange={(e) => updateRule('transfer_limits', { 
                          ...(currentRule.transfer_limits || {}), 
                          requires_approval: e.target.checked 
                        })}
                        className="h-4 w-4"
                        data-testid="transfer-approval-checkbox"
                      />
                      <Label htmlFor="transfer_approval" className="font-normal text-sm">
                        Manager onayı gerekli
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Visa Limits */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="visa_enabled"
                      checked={currentRule.visa_limits?.enabled ?? false}
                      onChange={(e) => updateRule('visa_limits', { 
                        ...(currentRule.visa_limits || {}), 
                        enabled: e.target.checked 
                      })}
                      className="h-4 w-4"
                      data-testid="visa-enabled-checkbox"
                    />
                    <Label htmlFor="visa_enabled" className="font-semibold text-base">
                      🛂 Vize İşlemleri
                    </Label>
                  </div>
                </div>
                
                {currentRule.visa_limits?.enabled && (
                  <div className="pl-6 space-y-3 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="visa_max_price">Maksimum Fiyat (TL)</Label>
                        <Input
                          id="visa_max_price"
                          type="number"
                          min="0"
                          value={currentRule.visa_limits?.max_price || ''}
                          onChange={(e) => updateRule('visa_limits', { 
                            ...(currentRule.visa_limits || {}), 
                            max_price: parseFloat(e.target.value) || null 
                          })}
                          placeholder="Limitsiz"
                          data-testid="visa-price-input"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="visa_approval"
                        checked={currentRule.visa_limits?.requires_approval ?? true}
                        onChange={(e) => updateRule('visa_limits', { 
                          ...(currentRule.visa_limits || {}), 
                          requires_approval: e.target.checked 
                        })}
                        className="h-4 w-4"
                        data-testid="visa-approval-checkbox"
                      />
                      <Label htmlFor="visa_approval" className="font-normal text-sm">
                        Manager onayı gerekli
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Insurance Limits */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="insurance_enabled"
                      checked={currentRule.insurance_limits?.enabled ?? false}
                      onChange={(e) => updateRule('insurance_limits', { 
                        ...(currentRule.insurance_limits || {}), 
                        enabled: e.target.checked 
                      })}
                      className="h-4 w-4"
                      data-testid="insurance-enabled-checkbox"
                    />
                    <Label htmlFor="insurance_enabled" className="font-semibold text-base">
                      🏥 Seyahat Sigortası
                    </Label>
                  </div>
                </div>
                
                {currentRule.insurance_limits?.enabled && (
                  <div className="pl-6 space-y-3 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="insurance_max_price">Maksimum Fiyat (TL)</Label>
                        <Input
                          id="insurance_max_price"
                          type="number"
                          min="0"
                          value={currentRule.insurance_limits?.max_price || ''}
                          onChange={(e) => updateRule('insurance_limits', { 
                            ...(currentRule.insurance_limits || {}), 
                            max_price: parseFloat(e.target.value) || null 
                          })}
                          placeholder="Limitsiz"
                          data-testid="insurance-price-input"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="insurance_approval"
                        checked={currentRule.insurance_limits?.requires_approval ?? true}
                        onChange={(e) => updateRule('insurance_limits', { 
                          ...(currentRule.insurance_limits || {}), 
                          requires_approval: e.target.checked 
                        })}
                        className="h-4 w-4"
                        data-testid="insurance-approval-checkbox"
                      />
                      <Label htmlFor="insurance_approval" className="font-normal text-sm">
                        Manager onayı gerekli
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Car Rental Limits */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="car_rental_enabled"
                      checked={currentRule.car_rental_limits?.enabled ?? false}
                      onChange={(e) => updateRule('car_rental_limits', { 
                        ...(currentRule.car_rental_limits || {}), 
                        enabled: e.target.checked 
                      })}
                      className="h-4 w-4"
                      data-testid="car-rental-enabled-checkbox"
                    />
                    <Label htmlFor="car_rental_enabled" className="font-semibold text-base">
                      🚙 Araç Kiralama
                    </Label>
                  </div>
                </div>
                
                {currentRule.car_rental_limits?.enabled && (
                  <div className="pl-6 space-y-3 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="car_rental_max_price">Maksimum Fiyat (TL)</Label>
                        <Input
                          id="car_rental_max_price"
                          type="number"
                          min="0"
                          value={currentRule.car_rental_limits?.max_price || ''}
                          onChange={(e) => updateRule('car_rental_limits', { 
                            ...(currentRule.car_rental_limits || {}), 
                            max_price: parseFloat(e.target.value) || null 
                          })}
                          placeholder="Limitsiz"
                          data-testid="car-rental-price-input"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="car_rental_approval"
                        checked={currentRule.car_rental_limits?.requires_approval ?? true}
                        onChange={(e) => updateRule('car_rental_limits', { 
                          ...(currentRule.car_rental_limits || {}), 
                          requires_approval: e.target.checked 
                        })}
                        className="h-4 w-4"
                        data-testid="car-rental-approval-checkbox"
                      />
                      <Label htmlFor="car_rental_approval" className="font-normal text-sm">
                        Manager onayı gerekli
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Not:</strong> Birden fazla kural tanımlıyorsanız, öncelik sırasına göre ilk eşleşen kural uygulanır.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
