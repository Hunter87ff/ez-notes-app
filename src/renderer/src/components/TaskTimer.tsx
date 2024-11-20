import { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Clock } from 'lucide-react';

const TIME_UNITS = {
  seconds: 1,
  minutes: 60,
  hours: 3600
};

const TaskTimer = () => {
  const [initialTime, setInitialTime] = useState(60);
  const [timeUnit, setTimeUnit] = useState('seconds');
  const [time, setTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('ready');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);

    switch (timeUnit) {
      case 'hours':
        const hours = Math.floor(absSeconds / 3600);
        const remainingMinutes = Math.floor((absSeconds % 3600) / 60);
        const remainingSeconds = absSeconds % 60;
        return `${isNegative ? '-' : ''}${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      
      case 'minutes':
        const minutes = Math.floor(absSeconds / 60);
        const seconds = absSeconds % 60;
        return `${isNegative ? '-' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      default: // seconds
        return `${isNegative ? '-' : ''}${absSeconds.toString().padStart(2, '0')}`;
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setStatus('running');
  };

  const handlePause = () => {
    setIsRunning(false);
    setStatus('paused');
  };

  const handleStop = () => {
    setIsRunning(false);
    setStatus('stopped');
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(initialTime * TIME_UNITS[timeUnit]);
    setStatus('ready');
  };

  const handleTimeChange = (e) => {
    const newTime = parseInt(e.target.value, 10);
    setInitialTime(newTime);
    setTime(newTime * TIME_UNITS[timeUnit]);
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    const convertedTime = Math.round(initialTime * TIME_UNITS[timeUnit] / TIME_UNITS[newUnit]);
    setTimeUnit(newUnit);
    setInitialTime(convertedTime);
    setTime(convertedTime * TIME_UNITS[newUnit]);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const getGradientColors = () => {
    if (time > 0) {
      return 'from-purple-500 to-blue-500';
    } else if (time === 0) {
      return 'from-yellow-500 to-orange-500';
    } else {
      return 'from-red-500 to-pink-500';
    }
  };

  const buttonClasses = "p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg";

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-xl w-80 bg-gradient-to-br ${getGradientColors()} transition-colors duration-700`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl" />
      
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="text-white/80 text-sm mb-2 font-medium">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>

        <div className="bg-white/20 rounded-lg px-4 py-2 mb-6 w-full text-center relative">
          {isEditing ? (
            <div className="flex justify-center items-center gap-2">
              <input
                type="number"
                value={initialTime}
                onChange={handleTimeChange}
                className="text-4xl font-mono font-bold text-white bg-transparent w-24 text-center focus:outline-none"
                min="1"
                max="99"
              />
              <select 
                value={timeUnit} 
                onChange={handleUnitChange}
                className="bg-white/20 text-white rounded px-2 py-1"
              >
                {Object.keys(TIME_UNITS).map(unit => (
                  <option key={unit} value={unit} className="text-black">
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={`text-4xl font-mono font-bold text-white shadow-sm transition-all duration-300 ${time === 0 ? 'scale-110' : ''}`}>
              {formatTime(time)}
            </div>
          )}
          
          <button 
            onClick={toggleEditMode} 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
            aria-label={isEditing ? "Finish Editing" : "Edit Time"}
          >
            <Clock className="w-5 h-5" />
          </button>

          {time <= 0 && (
            <div className="text-white/80 text-sm mt-1 font-medium">
              Time Exceeded
            </div>
          )}
        </div>
        
        {/* Rest of the component remains the same as previous version */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleStart}
            disabled={status === 'running'}
            className={`${buttonClasses} ${status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Start"
          >
            <Play className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={handlePause}
            disabled={!isRunning}
            className={`${buttonClasses} ${!isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Pause"
          >
            <Pause className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleStop}
            disabled={status === 'stopped' || status === 'ready'}
            className={`${buttonClasses} ${(status === 'stopped' || status === 'ready') ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Stop"
          >
            <Square className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={handleReset}
            className={buttonClasses}
            aria-label="Reset"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="mt-4 text-white/80 text-xs">
          {status === 'ready' && 'Press Start to begin'}
          {status === 'running' && 'Timer running'}
          {status === 'paused' && 'Timer paused'}
          {status === 'stopped' && 'Timer stopped'}
        </div>
      </div>
      
      <div className={`absolute -bottom-4 left-4 right-4 h-8 bg-gradient-to-br ${getGradientColors()} opacity-30 blur-lg rounded-full transition-colors duration-700`} />
    </div>
  );
};

export default TaskTimer;