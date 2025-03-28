import React from 'react';

type ProgressBarProps = {
  progress: number;
  statusMessage?: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, statusMessage }) => {
  return (
    <div className="analysis-progress">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="progress-text">{progress}%</div>
      </div>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
};

export default ProgressBar; 