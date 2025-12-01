

import React, { useState, useRef } from 'react';
import { UITexts } from '../types';
import EditableField from './EditableField';

interface AdminPanelProps {
    onSendNotification: (message: string) => void;
    isEditMode: boolean;
    onToggleEditMode: () => void;
    uiTexts: UITexts;
    onUpdateUiText: (page: 'adminPanel', key: string, value: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSendNotification, isEditMode, onToggleEditMode, uiTexts, onUpdateUiText }) => {
    const [message, setMessage] = useState('');
    const texts = uiTexts.adminPanel;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendNotification(message.trim());
            setMessage('');
            alert('Notificação enviada!');
        }
    };

    return (
        <div>
            <div className="text-center mb-8">
                <EditableField as="h2" isEditing={isEditMode} value={texts.title} onChange={v => onUpdateUiText('adminPanel', 'title', v)} className="text-2xl font-bold" />
                <EditableField as="p" isEditing={isEditMode} value={texts.subtitle} onChange={v => onUpdateUiText('adminPanel', 'subtitle', v)} className="text-on-surface-secondary" />
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-surface-100 rounded-lg p-6 border border-surface-200">
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-on-surface">
                            <EditableField as="span" isEditing={isEditMode} value={texts.editModeLabel} onChange={v => onUpdateUiText('adminPanel', 'editModeLabel', v)} />
                        </h3>
                        <div 
                            onClick={onToggleEditMode}
                            className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${isEditMode ? 'bg-primary justify-end' : 'bg-surface-200 justify-start'}`}
                        >
                            <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-100 rounded-lg p-6 border border-surface-200">
                    <h3 className="text-lg font-semibold text-on-surface mb-4">
                        <EditableField as="span" isEditing={isEditMode} value={texts.notificationTitle} onChange={v => onUpdateUiText('adminPanel', 'notificationTitle', v)} />
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={texts.notificationPlaceholder}
                            className="w-full bg-surface-200 p-3 rounded-md border border-surface-300 focus:border-primary focus:outline-none"
                            rows={4}
                            required
                        />
                        <button type="submit" className="mt-4 w-full bg-primary text-on-primary font-semibold py-2.5 rounded-md text-sm hover:opacity-90">
                             <EditableField as="span" isEditing={isEditMode} value={texts.notificationButton} onChange={v => onUpdateUiText('adminPanel', 'notificationButton', v)} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;