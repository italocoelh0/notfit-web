
import React, { useState, useRef, useEffect } from 'react';
import { UserData, UITexts } from '../types';
import EditableField from './EditableField';
import { ADVENTURE_ACTIVITIES } from '../constants';
import { api } from '@services/api';

interface EditProfilePageProps {
    userData: UserData;
    onUpdateUserData: (updatedData: Partial<UserData>) => Promise<boolean>;
    onLogout: () => void;
    onBack: () => void;
    isEditMode: boolean;
    uiTexts: UITexts;
    onUpdateUiText: (page: 'profile', key: string, value: string) => void;
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({ userData, onUpdateUserData, onLogout, onBack, isEditMode, uiTexts, onUpdateUiText }) => {
    // Account states
    const [name, setName] = useState(userData.name);
    const [username, setUsername] = useState(userData.username || '');
    const [usernameError, setUsernameError] = useState('');
    const [email, setEmail] = useState(userData.email);
    const [avatar, setAvatar] = useState(userData.userAvatar);
    
    // Nutritional states
    const [isPublic, setIsPublic] = useState(userData.isProfilePublic ?? true);
    const [weight, setWeight] = useState(userData.weight);
    const [height, setHeight] = useState(userData.height || '');
    const [bio, setBio] = useState(userData.bio || '');
    const [activityType, setActivityType] = useState(userData.activityType || 'trilha');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const texts = uiTexts.profile;

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
        setUsername(value);
        setUsernameError('');
    };

    useEffect(() => {
        const checkUsername = async () => {
            if (!username || username === userData.username) {
                setUsernameError('');
                return;
            };
            const exists = await api.users.checkUsername(username);
            if (exists) {
                setUsernameError('Usuário existente.');
            } else {
                setUsernameError('');
            }
        };

        const debounce = setTimeout(checkUsername, 300);
        return () => clearTimeout(debounce);
    }, [username, userData.username]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatar(e.target?.result as string);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };
    
    const handleSaveChanges = async () => {
        if (usernameError) return;
        
        const success = await onUpdateUserData({ 
            name, 
            username,
            userAvatar: avatar,
            isProfilePublic: isPublic,
            weight: Number(weight),
            height: Number(height),
            bio,
            activityType
        });
        
        if (success) {
            onBack();
        }
    };
    
    const inputStyles = "w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-md placeholder-on-surface-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm";
    const labelStyles = "block text-on-surface font-semibold mb-1 text-sm";

    return (
        <div>
            <div className="flex items-center mb-8">
                 <button onClick={onBack} className="mr-4 text-on-surface-secondary hover:text-on-surface">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                 </button>
                 <EditableField as="h2" isEditing={isEditMode} value={texts.title} onChange={v => onUpdateUiText('profile', 'title', v)} className="text-2xl font-bold" />
            </div>

            <div className="max-w-xl mx-auto space-y-6">
                {/* Avatar Section */}
                <div className="bg-surface-100 rounded-lg p-6 border border-surface-200 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full mb-4 relative group bg-surface-200">
                        {avatar.startsWith('data:image') ? <img src={avatar} alt="User Avatar" className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full rounded-full bg-surface-200 flex items-center justify-center text-5xl">{avatar}</div>}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-primary hover:underline">
                            <EditableField as="span" isEditing={isEditMode} value={texts.changePhotoButton} onChange={v => onUpdateUiText('profile', 'changePhotoButton', v)} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                        <button onClick={() => setAvatar('👤')} className="text-sm font-semibold text-on-surface-secondary hover:underline">
                             <EditableField as="span" isEditing={isEditMode} value={texts.removePhotoButton} onChange={v => onUpdateUiText('profile', 'removePhotoButton', v)} />
                        </button>
                    </div>
                </div>

                {/* Account Data */}
                <div className="bg-surface-100 rounded-lg p-6 border border-surface-200 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Dados da Conta</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-on-surface-secondary">{isPublic ? 'Público' : 'Privado'}</span>
                            <div 
                                onClick={() => setIsPublic(!isPublic)}
                                className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${isPublic ? 'bg-primary justify-end' : 'bg-surface-200 justify-start'}`}
                            >
                                <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className={labelStyles}>Nome</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="username" className={labelStyles}>Nome de usuário</label>
                        <input id="username" type="text" value={username} onChange={handleUsernameChange} placeholder="@ que utilizará" className={`${inputStyles} ${usernameError ? 'border-red-500' : ''}`} />
                        {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
                        {!usernameError && <p className="text-xs text-on-surface-secondary mt-1">Apenas letras minúsculas, números, `.` e `_`.</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className={labelStyles}>E-mail</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputStyles} bg-surface-300 text-on-surface-secondary`} readOnly />
                    </div>
                     <div>
                        <label htmlFor="bio" className={labelStyles}>Sobre você</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Diga algo sobre você..." className={`${inputStyles} min-h-[80px]`} />
                    </div>
                     <div>
                        <label htmlFor="activityType" className={labelStyles}>Tipo de rolê</label>
                        <select id="activityType" value={activityType} onChange={(e) => setActivityType(e.target.value)} className={inputStyles}>
                            {ADVENTURE_ACTIVITIES.map(activity => (
                                <option key={activity.key} value={activity.key}>{activity.icon} {activity.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4">
                    <button onClick={handleSaveChanges} disabled={!!usernameError} className="w-full bg-primary text-on-primary font-semibold py-2.5 rounded-md text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                        <EditableField as="span" isEditing={isEditMode} value={texts.saveButton} onChange={v => onUpdateUiText('profile', 'saveButton', v)} />
                    </button>
                    <button onClick={onLogout} className="w-full bg-surface-200 text-on-surface font-semibold py-2.5 rounded-md text-sm hover:bg-surface-300">
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;

