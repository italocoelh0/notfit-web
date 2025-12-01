


import React, { useState, useCallback } from 'react';
import { UserData, CheckinItemData, UITexts } from '../types';
import EditableField from '../components/EditableField';

interface CheckinItemProps {
    icon: string;
    label: string;
    isChecked: boolean;
    onToggle: () => void;
    isEditing: boolean;
    onUpdate: (field: 'icon' | 'label', value: string) => void;
}

const CheckinItem: React.FC<CheckinItemProps> = ({ icon, label, isChecked, onToggle, isEditing, onUpdate }) => (
    <div
        onClick={() => !isEditing && onToggle()}
        className={`p-3 rounded-lg cursor-pointer transition-all text-center font-semibold border
        ${isChecked ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-100 border-surface-200 text-on-surface-secondary hover:bg-surface-200'}`}
    >
        <EditableField as="span" isEditing={isEditing} value={icon} onChange={v => onUpdate('icon', v)} className="text-3xl block mb-2" />
        <EditableField as="span" isEditing={isEditing} value={label} onChange={v => onUpdate('label', v)} className="text-xs" />
    </div>
);

interface StatCardProps {
    icon: string;
    label: string;
    value: string;
    isEditing: boolean;
    onLabelChange: (value: string) => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, isEditing, onLabelChange }) => (
    <div className="bg-surface-100 rounded-lg p-5 flex items-center gap-4 border border-surface-200">
        <div className="w-12 h-12 bg-surface-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
        </div>
        <div>
            <EditableField as="h3" isEditing={isEditing} value={label} onChange={onLabelChange} className="font-semibold text-on-surface-secondary mb-1 text-sm" />
            <p className="text-xl font-bold text-on-surface capitalize">{value}</p>
        </div>
    </div>
);


interface HomePageProps {
  userData: UserData;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: 'home', key: string, value: string) => void;
  checkinItems: CheckinItemData[];
  onUpdateCheckinItem: (index: number, item: CheckinItemData) => void;
}

const HomePage: React.FC<HomePageProps> = ({ userData, isEditMode, uiTexts, onUpdateUiText, checkinItems, onUpdateCheckinItem }) => {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const todayProgress = Object.values(checkedItems).filter(Boolean).length;
    const goalText = userData.goals.join(', ').replace(/-/g, ' ');

    const handleToggleCheckin = useCallback((key: string) => {
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);
    
    const texts = uiTexts.home;

    return (
         <div className="space-y-6">
            <div className="bg-surface-100 p-6 rounded-lg border border-surface-200">
                <EditableField as="h2" isEditing={isEditMode} value={texts.checkinTitle} onChange={v => onUpdateUiText('home', 'checkinTitle', v)} className="text-xl font-bold text-center mb-1" />
                <EditableField as="p" isEditing={isEditMode} value={texts.checkinSubtitle} onChange={v => onUpdateUiText('home', 'checkinSubtitle', v)} className="text-center text-on-surface-secondary mb-6" />

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                   {checkinItems.map((item, index) => (
                       <CheckinItem 
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            isChecked={!!checkedItems[item.key]}
                            onToggle={() => handleToggleCheckin(item.key)}
                            isEditing={isEditMode}
                            onUpdate={(field, value) => onUpdateCheckinItem(index, {...item, [field]: value})}
                       />
                   ))}
                </div>
                 <div className="text-center mt-6">
                    <div className="inline-block bg-surface-200 text-on-surface font-semibold px-4 py-2 rounded-full text-sm">
                        <EditableField as="span" isEditing={isEditMode} value={texts.streakText} onChange={v => onUpdateUiText('home', 'streakText', v)} />
                        <span> 🔥 0 dias</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon="🎯" label={texts.goalStat} value={goalText} isEditing={isEditMode} onLabelChange={v => onUpdateUiText('home', 'goalStat', v)} />
                <StatCard icon="⚖️" label={texts.weightStat} value={`${userData.weight} kg`} isEditing={isEditMode} onLabelChange={v => onUpdateUiText('home', 'weightStat', v)} />
                <StatCard icon="✅" label={texts.progressStat} value={`${todayProgress}/${checkinItems.length}`} isEditing={isEditMode} onLabelChange={v => onUpdateUiText('home', 'progressStat', v)} />
            </div>
        </div>
    );
};

export default HomePage;