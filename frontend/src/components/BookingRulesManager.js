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

            {/* Hotel Rules */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold">Otel Rezervasyon Limitleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hotel_stars">Maksimum Yıldız</Label>
                  <Input
                    id="hotel_stars"
                    type="number"
                    min="1"
                    max="5"
                    value={currentRule.hotel_max_stars}
                    onChange={(e) => updateRule('hotel_max_stars', parseInt(e.target.value))}
                    data-testid="hotel-stars-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotel_price">Maksimum Gecelik Fiyat (TL)</Label>
                  <Input
                    id="hotel_price"
                    type="number"
                    min="0"
                    value={currentRule.hotel_max_price_per_night || ''}
                    onChange={(e) => updateRule('hotel_max_price_per_night', parseFloat(e.target.value) || null)}
                    placeholder="Limitsiz için boş bırakın"
                    data-testid="hotel-price-input"
                  />
                </div>
              </div>
            </div>

            {/* Approval Rules */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold">Onay Kuralları</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requires_approval"
                  checked={currentRule.requires_manager_approval}
                  onChange={(e) => updateRule('requires_manager_approval', e.target.checked)}
                  className="h-4 w-4"
                  data-testid="requires-approval-checkbox"
                />
                <Label htmlFor="requires_approval" className="font-normal">
                  Rezervasyonlar manager onayı gerektirsin
                </Label>
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
