export type GeneratorStatus = 'Running' | 'Not Running' | 'Fault';
export type ControlMode = 'Auto' | 'Manual';

export interface Generator {
  id: string;
  name: string;
  status: GeneratorStatus;
  engine_speed: number;
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
  /*{
    id: '6', name: 'Diesel Genset 6', status: 'Running',
    engine_speed: 1500, oilPressure: 45, coolantTemp: 82, voltage: 415,
    frequency: 50.0, controlMode: 'Auto', engineStarts: 342, engineHours: 12450,
    engineBattery: 27.2, mainsPF: 0.92, locationi
    genPower: { kWh: 8520, kVAh: 9260, kVARh: 3620 },
    mainsPower: { kWh: 45200, kVARh: 12800 },
    alarms: ['Low Fuel Warning', 'None', 'None'],
  },*/
  {
    id: '6', name: 'Diesel Genset 6', location: 'Generator Room',
  },
  {
    id: '9', name: 'DSE Panel', location: 'Monitoring Room',
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
