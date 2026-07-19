export type GeneratorStatus = 'Running' | 'Stopped' | 'Fault';

export interface Generator {
  dg_id: string;
  name: string;
  status: GeneratorStatus;
  control_mode: string;
  engine_speed: number;
  oil_pressure: number;
  coolant_temperature: number;
  generator_voltage: number;
  generator_frequency: number;
  created_at: string;
  location: string;
  engine_starts: number;
  engine_hours: string;
  alarm_1: string;
  alarm_2: string;
  alarm_3: string;
  mains_kw: string;
  mains_kva: string;
  mains_kvar: string;
  mains_pf: string;
  generator_kw: string;
  gen_kva: string;
  gen_kvar: string;
}

export interface LiveParameters extends Generator {
  updated_at: string;
}

export interface GeneratorListResponse { data: Generator[]; total: number; }
export interface GeneratorDetailResponse { data: Generator; }
export interface LiveParametersResponse { data: LiveParameters; }
export interface AnalyticsResponse {
  data: {
    timestamp: string;
    generator_voltage: number;
    generator_frequency: number;
    engine_speed: number;
    coolant_temperature: number;
    oil_pressure: number;
    engine_starts?: number;
    engine_hours?: string;
    alarm_1?: string;
    alarm_2?: string;
    alarm_3?: string;
    mains_kw?: string;
    mains_kva?: string;
    mains_kvar?: string;
    mains_pf?: string;
    generator_kw?: string;
    generator_kva?: string;
    generator_kvar?: string;
    generator_pf?: string;
  }[];
  generator?: Generator;
}