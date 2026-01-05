import React from 'react';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
      <ChatInterface />
    </div>
  );
};

export default App;