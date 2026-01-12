


import React from 'react';

interface EditableFieldProps {
    isEditing: boolean;
    value: string;
    onChange: (value: string) => void;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'label' | 'textarea';
    className?: string;
    placeholder?: string;
    [x: string]: any; // Allow other props
}

const EditableField: React.FC<EditableFieldProps> = ({
    isEditing,
    value,
    onChange,
    as = 'span',
    className = '',
    placeholder = 'Edit Text',
    ...props
}) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    if (isEditing) {
        const commonProps = {
            value: value,
            onChange: handleInputChange,
            className: `bg-primary/10 border-2 border-primary rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${className}`,
            placeholder,
        };

        if (as === 'textarea') {
            return <textarea {...commonProps} rows={3} />;
        }
        
        return <input type="text" {...commonProps} />;
    }
    
    return React.createElement(as, { className, ...props }, value);
};

export default EditableField;