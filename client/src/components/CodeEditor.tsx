import React from 'react';

type CodeEditorProps = {
  code: string;
  language: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div className="form-group">
      <label htmlFor="code">Enter your code:</label>
      <textarea
        id="code"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        placeholder={`Enter your ${language} code here...`}
        disabled={disabled}
        className="code-editor"
      />
    </div>
  );
};

export default CodeEditor; 