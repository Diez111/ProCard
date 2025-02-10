import React, { useState } from 'react';
import { useBoardStore } from '../store/board-store';
import './DashboardBar.css';

const DashboardBar: React.FC = () => {
  const [newDashboardName, setNewDashboardName] = useState('');
  const [editName, setEditName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  
  const {
    dashboardNames,
    selectedDashboard,
    createDashboard,
    selectDashboard,
    editDashboardName,
    deleteDashboard
  } = useBoardStore();

  const handleAddDashboard = () => {
    if (newDashboardName.trim() === '') return;
    createDashboard(newDashboardName.trim());
    setNewDashboardName('');
  };

  const startEditing = (id: string, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  const finishEditing = (id: string) => {
    if (editName.trim() !== '') {
      editDashboardName(id, editName.trim());
    }
    setEditId(null);
    setEditName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      finishEditing(id);
    }
  };

  return (
    <div className="dashboard-bar">
      <div className="dashboards-container">
        {Object.entries(dashboardNames).map(([id, name]) => (
          <div
            key={id}
            className={`dashboard-item ${selectedDashboard === id ? 'selected' : ''}`}
            onClick={() => selectDashboard(id)}
          >
            {editId === id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => finishEditing(id)}
                onKeyPress={(e) => handleKeyPress(e, id)}
                className="edit-input"
                autoFocus
              />
            ) : (
              <span className="dashboard-name">{name}</span>
            )}
            <div className="dashboard-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(id, name);
                }}
                className="edit-btn"
              >
                Editar
              </button>
              {id !== 'default' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDashboard(id);
                  }}
                  className="delete-btn"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="new-dashboard">
        <input
          type="text"
          placeholder="Nombre del nuevo dashboard"
          value={newDashboardName}
          onChange={(e) => setNewDashboardName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleAddDashboard();
          }}
        />
        <button onClick={handleAddDashboard}>Agregar</button>
      </div>
    </div>
  );
};

export default DashboardBar;
