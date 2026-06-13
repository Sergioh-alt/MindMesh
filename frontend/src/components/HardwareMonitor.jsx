import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HardwareMonitor = () => {
  const [cpu, setCpu] = useState(0);
  const [ram, setRam] = useState(0);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/telemetry');
        setCpu(Number(res.data.cpu_usage_pct) || 0);
        setRam(Number(res.data.ram_usage_pct) || 0);
      } catch {
        setCpu(0);
        setRam(0);
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center font-mono text-[10px] text-gray-400">
       <span className="uppercase font-bold text-gray-500 mr-1.5">CPU:</span>
       <span className={`font-bold transition-colors w-[45px] ${cpu > 80 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
         {cpu.toFixed(1)}%
       </span>

       <span className="mx-4 opacity-20">//</span>
       
       <span className="uppercase font-bold text-gray-500 mr-1.5">RAM:</span>
       <span className={`font-bold transition-colors w-[45px] ${ram > 80 ? 'text-purple-500 animate-pulse' : 'text-purple-400'}`}>
         {ram.toFixed(1)}%
       </span>
    </div>
  );
};

export default HardwareMonitor;
