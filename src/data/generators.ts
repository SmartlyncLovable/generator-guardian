export type GeneratorStatus = 'Running' | 'Stopped' | 'Fault';
export type ControlMode = 'Auto' | 'Manual';

export interface Generator {
  id: string;
  name: string;
  status: GeneratorStatus;
  engineSpeed: number;
  oilPressure: number;
  coolantTemp: number;
  voltage: number;
  frequency: number;
  controlMode: ControlMode;
  engineStarts: number;
  engineHours: number;
  engineBattery: number;
  mainsPF: number;
  genPower: { kWh: number; kVAh: number; kVARh: number };
  mainsPower: { kWh: number; kVARh: number };
  alarms: [string, string, string];
}

export const generators: Generator[] = [
  {
    id: 'DG-001', name: 'Generator Alpha', status: 'Running',
    engineSpeed: 1500, oilPressure: 45, coolantTemp: 82, voltage: 415,
    frequency: 50.0, controlMode: 'Auto', engineStarts: 342, engineHours: 12450,
    engineBattery: 27.2, mainsPF: 0.92,
    genPower: { kWh: 8520, kVAh: 9260, kVARh: 3620 },
    mainsPower: { kWh: 45200, kVARh: 12800 },
    alarms: ['Low Fuel Warning', 'None', 'None'],
  },
  {
    id: 'DG-002', name: 'Generator Beta', status: 'Running',
    engineSpeed: 1498, oilPressure: 48, coolantTemp: 78, voltage: 412,
    frequency: 50.1, controlMode: 'Auto', engineStarts: 198, engineHours: 8920,
    engineBattery: 27.8, mainsPF: 0.95,
    genPower: { kWh: 6200, kVAh: 6526, kVARh: 2040 },
    mainsPower: { kWh: 38400, kVARh: 10200 },
    alarms: ['None', 'None', 'None'],
  },
  {
    id: 'DG-003', name: 'Generator Gamma', status: 'Stopped',
    engineSpeed: 0, oilPressure: 0, coolantTemp: 32, voltage: 0,
    frequency: 0, controlMode: 'Manual', engineStarts: 520, engineHours: 18200,
    engineBattery: 25.1, mainsPF: 0,
    genPower: { kWh: 0, kVAh: 0, kVARh: 0 },
    mainsPower: { kWh: 52100, kVARh: 14800 },
    alarms: ['None', 'None', 'None'],
  },
  {
    id: 'DG-004', name: 'Generator Delta', status: 'Fault',
    engineSpeed: 0, oilPressure: 12, coolantTemp: 98, voltage: 380,
    frequency: 48.5, controlMode: 'Auto', engineStarts: 410, engineHours: 15600,
    engineBattery: 22.4, mainsPF: 0.78,
    genPower: { kWh: 4100, kVAh: 5260, kVARh: 3290 },
    mainsPower: { kWh: 41000, kVARh: 13500 },
    alarms: ['High Coolant Temp', 'Low Oil Pressure', 'Overvoltage Trip'],
  },
  {
    id: 'DG-005', name: 'Generator Epsilon', status: 'Running',
    engineSpeed: 1502, oilPressure: 42, coolantTemp: 85, voltage: 418,
    frequency: 50.0, controlMode: 'Auto', engineStarts: 156, engineHours: 5400,
    engineBattery: 28.1, mainsPF: 0.94,
    genPower: { kWh: 3200, kVAh: 3404, kVARh: 1160 },
    mainsPower: { kWh: 28900, kVARh: 7600 },
    alarms: ['None', 'None', 'None'],
  },
  {
    id: 'DG-006', name: 'Generator Zeta', status: 'Running',
    engineSpeed: 1497, oilPressure: 50, coolantTemp: 76, voltage: 414,
    frequency: 50.0, controlMode: 'Manual', engineStarts: 88, engineHours: 3200,
    engineBattery: 27.5, mainsPF: 0.93,
    genPower: { kWh: 2100, kVAh: 2258, kVARh: 830 },
    mainsPower: { kWh: 19500, kVARh: 5200 },
    alarms: ['None', 'Battery Low Warning', 'None'],
  },
];

export const generateTimeSeries = (baseValue: number, variance: number, points = 24) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    value: +(baseValue + (Math.random() - 0.5) * variance * 2).toFixed(1),
  }));
};

export interface LogEntry {
  id: string;
  timestamp: string;
  generatorId: string;
  eventType: 'Start' | 'Stop' | 'Alarm' | 'Fault';
  description: string;
}

export const logEntries: LogEntry[] = [
  { id: '1', timestamp: '2026-04-15 08:12:34', generatorId: 'DG-001', eventType: 'Start', description: 'Generator started in Auto mode' },
  { id: '2', timestamp: '2026-04-15 07:45:12', generatorId: 'DG-004', eventType: 'Fault', description: 'High coolant temperature detected — 98°C' },
  { id: '3', timestamp: '2026-04-15 07:30:00', generatorId: 'DG-004', eventType: 'Alarm', description: 'Low oil pressure alarm triggered' },
  { id: '4', timestamp: '2026-04-15 06:55:22', generatorId: 'DG-003', eventType: 'Stop', description: 'Generator stopped manually by operator' },
  { id: '5', timestamp: '2026-04-15 06:10:45', generatorId: 'DG-002', eventType: 'Start', description: 'Generator started in Auto mode' },
  { id: '6', timestamp: '2026-04-14 22:30:10', generatorId: 'DG-006', eventType: 'Alarm', description: 'Battery voltage low — 22.4V' },
  { id: '7', timestamp: '2026-04-14 18:15:33', generatorId: 'DG-005', eventType: 'Start', description: 'Generator started in Auto mode' },
  { id: '8', timestamp: '2026-04-14 14:00:00', generatorId: 'DG-001', eventType: 'Alarm', description: 'Low fuel level warning' },
  { id: '9', timestamp: '2026-04-14 10:22:18', generatorId: 'DG-003', eventType: 'Start', description: 'Generator started for scheduled test run' },
  { id: '10', timestamp: '2026-04-14 09:45:55', generatorId: 'DG-003', eventType: 'Stop', description: 'Test run completed, generator stopped' },
  { id: '11', timestamp: '2026-04-13 16:30:00', generatorId: 'DG-004', eventType: 'Fault', description: 'Overvoltage trip on generator output' },
  { id: '12', timestamp: '2026-04-13 12:00:00', generatorId: 'DG-002', eventType: 'Stop', description: 'Scheduled maintenance shutdown' },
];
