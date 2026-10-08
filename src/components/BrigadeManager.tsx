import React, { useState } from 'react';
import { Brigade } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface BrigadeManagerProps {
  brigades: Brigade[];
  onSaveBrigade: (brigade: Brigade) => void;
  onDeleteBrigade: (id: string) => void;
}

export default function BrigadeManager({ brigades, onSaveBrigade, onDeleteBrigade }: BrigadeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingBrigade, setEditingBrigade] = useState<Brigade | null>(null);
  const [name, setName] = useState('');
  const [foreman, setForeman] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');

  const resetForm = () => {
    setName('');
    setForeman('');
    setPhone('');
    setSpecialization('');
    setEditingBrigade(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!name.trim() || !foreman.trim()) return;
    
    if (editingBrigade) {
      onSaveBrigade({ ...editingBrigade, name, foreman, phone, specialization });
    } else {
      const newBrigade: Brigade = {
        id: uuidv4(),
        name,
        foreman,
        phone,
        specialization
      };
      onSaveBrigade(newBrigade);
    }
    resetForm();
  };

  const handleEdit = (brigade: Brigade) => {
    setEditingBrigade(brigade);
    setName(brigade.name);
    setForeman(brigade.foreman);
    setPhone(brigade.phone);
    setSpecialization(brigade.specialization);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Бригады</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новая бригада
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">{editingBrigade ? 'Редактировать бригаду' : 'Новая бригада'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название бригады *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Бригада №1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО прораба *</label>
                <input
                  type="text"
                  value={foreman}
                  onChange={(e) => setForeman(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Специализация</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите специализацию</option>
                  <option value="Общестроительные работы">Общестроительные работы</option>
                  <option value="Монолитные работы">Монолитные работы</option>
                  <option value="Каменная кладка">Каменная кладка</option>
                  <option value="Кровельные работы">Кровельные работы</option>
                  <option value="Отделочные работы">Отделочные работы</option>
                  <option value="Электромонтажные работы">Электромонтажные работы</option>
                  <option value="Сантехнические работы">Сантехнические работы</option>
                  <option value="Фасадные работы">Фасадные работы</option>
                  <option value="Благоустройство">Благоустройство</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition">Отмена</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                {editingBrigade ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brigades List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brigades.map(brigade => (
          <div key={brigade.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{brigade.name}</h3>
                  {brigade.specialization && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{brigade.specialization}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(brigade)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteBrigade(brigade.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {brigade.foreman}
              </div>
              {brigade.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {brigade.phone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {brigades.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">👷</div>
          <p className="text-gray-500 text-lg mb-2">Пока нет бригад</p>
          <p className="text-gray-400 text-sm">Нажмите «Новая бригада» чтобы добавить первую</p>
        </div>
      )}
    </div>
  );
}
